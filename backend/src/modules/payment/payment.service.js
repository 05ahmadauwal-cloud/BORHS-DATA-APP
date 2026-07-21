const axios = require('axios');
const crypto = require('crypto');
const { fundWallet } = require('../wallet/wallet.service');
const { generateReference } = require('../../utils/helpers');
const logger = require('../../utils/logger');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { TRANSACTION_STATUS } = require('../../config/constants');
const monnifyReconciliation = new Map();

// ─── Paystack ────────────────────────────────────────────────────────────────
const paystackInitialize = async (userId, email, amount, metadata = {}) => {
  const reference = generateReference('PS');
  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email,
      amount: Math.round(amount * 100),
      reference,
      callback_url: `${process.env.CLIENT_URL}/wallet`,
      channels: ['card', 'bank', 'ussd', 'bank_transfer'],
      metadata: {
        userId: userId.toString(),
        ...metadata,
        custom_fields: [{
          display_name: 'Payment purpose',
          variable_name: 'payment_purpose',
          value: 'BORHS wallet funding',
        }],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return { reference, authorizationUrl: response.data.data.authorization_url, accessCode: response.data.data.access_code };
};

const paystackVerify = async (reference) => {
  const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  return response.data.data;
};

const verifyPaystackWebhook = (signature, body) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
  return hash === signature;
};

const handlePaystackWebhook = async (event, data) => {
  if (event === 'charge.success') {
    const { reference, amount, metadata, customer } = data;
    const amountNGN = amount / 100;
    const userId = metadata?.userId;
    if (!userId) {
      logger.warn(`Paystack webhook: no userId in metadata for ref ${reference}`);
      return;
    }
    await fundWallet(userId, amountNGN, 'paystack', reference, { email: customer?.email });
    logger.info(`Wallet funded via Paystack: userId=${userId}, amount=${amountNGN}, ref=${reference}`);
  }
};

// ─── Flutterwave ──────────────────────────────────────────────────────────────
const flutterwaveInitialize = async (userId, email, amount, name, phone, metadata = {}) => {
  const txRef = generateReference('FW');
  const response = await axios.post(
    'https://api.flutterwave.com/v3/payments',
    {
      tx_ref: txRef,
      amount,
      currency: 'NGN',
      redirect_url: `${process.env.CLIENT_URL}/payment/verify`,
      customer: { email, phonenumber: phone, name },
      customizations: {
        title: process.env.APP_NAME || 'BORHS Data',
        logo: `${process.env.CLIENT_URL}/logo.png`,
      },
      meta: { userId: userId.toString(), ...metadata },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return { txRef, paymentLink: response.data.data.link };
};

const flutterwaveVerify = async (transactionId) => {
  const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
  });
  return response.data.data;
};

const verifyFlutterwaveWebhook = (signature) => {
  return signature === process.env.FLUTTERWAVE_WEBHOOK_SECRET;
};

const handleFlutterwaveWebhook = async (event, data) => {
  if (event === 'charge.completed' && data.status === 'successful') {
    const { tx_ref, amount, meta } = data;
    const userId = meta?.userId;
    if (!userId) return;
    await fundWallet(userId, amount, 'flutterwave', tx_ref, { tx_ref });
    logger.info(`Wallet funded via Flutterwave: userId=${userId}, amount=${amount}`);
  }
};

// ─── Monnify ─────────────────────────────────────────────────────────────────
const handleMonnifyWebhook = async (rawBody, signature) => {
  const { verifyWebhookSignature } = require('../../services/monnify');

  if (!verifyWebhookSignature(rawBody, signature)) {
    throw Object.assign(new Error('Invalid Monnify webhook signature'), { statusCode: 401 });
  }

  const body = JSON.parse(rawBody);
  const { eventType, eventData } = body;

  if (eventType !== 'SUCCESSFUL_TRANSACTION') return;
  if (eventData?.paymentStatus !== 'PAID') return;

  const { transactionReference, amountPaid, customer } = eventData;

  // Reserved-account webhooks identify our reference through product.reference.
  // Some payload variants expose it directly or under reservedAccountDetails.
  const accountRef = eventData.product?.reference
    || eventData.accountReference
    || eventData.reservedAccountDetails?.accountReference;
  const destinationAccountNumber = eventData.destinationAccountInformation?.accountNumber;

  // Resolve by our deterministic reference, destination account, then customer email.
  let user = null;
  if (accountRef) {
    user = await User.findOne({ 'monnifyVirtualAccount.reference': accountRef });
  }
  if (!user && destinationAccountNumber) {
    user = await User.findOne({
      'monnifyVirtualAccount.accounts.accountNumber': destinationAccountNumber,
    });
  }
  if (!user && customer?.email) {
    user = await User.findOne({ email: customer.email.toLowerCase() });
  }

  if (!user) {
    logger.warn(`Monnify webhook: could not resolve user for ref ${transactionReference}`);
    return;
  }

  // Idempotency — skip if already processed
  const existing = await Transaction.findOne({ externalReference: transactionReference });
  if (existing) {
    logger.info(`Monnify webhook: duplicate transaction ${transactionReference}, skipping`);
    return;
  }

  await fundWallet(user._id, amountPaid, 'monnify', transactionReference, {
    customerName: customer?.customerName || customer?.name,
    customerEmail: customer?.email,
  });

  logger.info(`Monnify wallet funded: userId=${user._id}, amount=${amountPaid}, ref=${transactionReference}`);
};

// Webhooks are the instant path. This authenticated provider check recovers
// payments whose notifications were missed during downtime or deployment.
const reconcileMonnifyUser = async (userId) => {
  const key = String(userId);
  const active = monnifyReconciliation.get(key);
  if (active && Date.now() - active.startedAt < 15_000) return active.promise;

  const promise = (async () => {
    const user = await User.findById(userId).select('monnifyVirtualAccount');
    const accountReference = user?.monnifyVirtualAccount?.reference;
    if (!accountReference || user.monnifyVirtualAccount?.kycSyncStatus !== 'synced') {
      return { checked: false, credited: 0 };
    }

    const { getReservedAccountTransactions } = require('../../services/monnify');
    const payments = await getReservedAccountTransactions(accountReference, 20);
    const paid = payments
      .filter((payment) => payment.paymentStatus === 'PAID')
      .sort((a, b) => new Date(a.paidOn || 0) - new Date(b.paidOn || 0));
    let credited = 0;

    for (const payment of paid) {
      const reference = payment.transactionReference;
      const amount = Number(payment.amountPaid);
      if (!reference || !Number.isFinite(amount) || amount <= 0) continue;
      if (await Transaction.exists({ externalReference: reference })) continue;

      await fundWallet(userId, amount, 'monnify', reference, {
        paymentReference: payment.paymentReference,
        paidOn: payment.paidOn,
        reconciled: true,
      });
      credited += 1;
      logger.info(`Monnify reconciliation credited userId=${userId}, amount=${amount}, ref=${reference}`);
    }

    return { checked: true, credited };
  })().finally(() => {
    setTimeout(() => {
      const current = monnifyReconciliation.get(key);
      if (current?.promise === promise) monnifyReconciliation.delete(key);
    }, 15_000).unref?.();
  });

  monnifyReconciliation.set(key, { startedAt: Date.now(), promise });
  return promise;
};

// Billstack reserved-account payment notifications
const handleBillstackWebhook = async (rawBody, signature) => {
  const { verifyWebhookSignature } = require('../../services/billstack');
  if (!verifyWebhookSignature(signature)) {
    throw Object.assign(new Error('Invalid Billstack webhook signature'), { statusCode: 401 });
  }

  const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
  if (body?.event !== 'PAYMENT_NOTIFICATION' && body?.event !== 'PAYMENT_NOTIFIFICATION') return;
  if (body?.data?.type !== 'RESERVED_ACCOUNT_TRANSACTION') return;

  const { reference, merchant_reference: merchantReference, amount, payer } = body.data;
  const user = await User.findOne({ 'billstackVirtualAccount.reference': merchantReference });
  if (!user) {
    logger.warn(`Billstack webhook: could not resolve user for merchant ref ${merchantReference}`);
    return;
  }

  const existing = await Transaction.findOne({ externalReference: reference });
  if (existing) return;

  const amountNGN = Number(amount);
  if (!Number.isFinite(amountNGN) || amountNGN <= 0) throw new Error('Invalid Billstack payment amount');

  await fundWallet(user._id, amountNGN, 'billstack', reference, {
    merchantReference,
    payerAccount: payer?.account_number,
    payerName: [payer?.first_name, payer?.last_name].filter(Boolean).join(' '),
  });
  logger.info(`Billstack wallet funded: userId=${user._id}, amount=${amountNGN}, ref=${reference}`);
};

module.exports = {
  paystackInitialize,
  paystackVerify,
  verifyPaystackWebhook,
  handlePaystackWebhook,
  flutterwaveInitialize,
  flutterwaveVerify,
  verifyFlutterwaveWebhook,
  handleFlutterwaveWebhook,
  handleMonnifyWebhook,
  reconcileMonnifyUser,
  handleBillstackWebhook,
};
