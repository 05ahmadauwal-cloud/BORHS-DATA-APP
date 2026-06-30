const axios = require('axios');
const crypto = require('crypto');
const { fundWallet } = require('../wallet/wallet.service');
const { generateReference } = require('../../utils/helpers');
const logger = require('../../utils/logger');

// ─── Paystack ────────────────────────────────────────────────────────────────
const paystackInitialize = async (userId, email, amount, metadata = {}) => {
  const reference = generateReference('PS');
  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email,
      amount: Math.round(amount * 100),
      reference,
      callback_url: `${process.env.CLIENT_URL}/payment/verify`,
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

module.exports = {
  paystackInitialize,
  paystackVerify,
  verifyPaystackWebhook,
  handlePaystackWebhook,
  flutterwaveInitialize,
  flutterwaveVerify,
  verifyFlutterwaveWebhook,
  handleFlutterwaveWebhook,
};
