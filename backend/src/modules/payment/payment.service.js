const axios = require('axios');
const crypto = require('crypto');
const { fundWallet } = require('../wallet/wallet.service');
const { generateReference } = require('../../utils/helpers');
const logger = require('../../utils/logger');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { TRANSACTION_STATUS } = require('../../config/constants');

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
      metadata: { userId: userId.toString(), ...metadata },
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

  const { transactionReference, amountPaid, customer, paymentSourceInformation } = eventData;

  // Find user by the accountReference we set during account creation
  const accountRef = paymentSourceInformation?.[0]?.accountName
    ? undefined
    : eventData.accountReference || eventData.reservedAccountDetails?.accountReference;

  // Try finding by customer email first, then by accountReference
  let user = null;
  if (accountRef) {
    user = await User.findOne({ 'monnifyVirtualAccount.reference': accountRef });
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
};
