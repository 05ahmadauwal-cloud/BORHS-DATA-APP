const paymentService = require('./payment.service');
const Transaction = require('../../models/Transaction');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

const initializePaystack = async (req, res) => {
  const { amount } = req.body;
  if (amount < 100) return ApiResponse.error(res, 'Minimum funding amount is ₦100');
  const data = await paymentService.paystackInitialize(
    req.user._id,
    req.user.email,
    Number(amount),
    { source: 'wallet_fund' }
  );
  return ApiResponse.success(res, data, 'Payment initialized');
};

// Called after Paystack redirect — verifies AND credits wallet if not already done
const verifyPaystack = async (req, res) => {
  const { reference } = req.params;

  // Check if this reference was already processed
  const existing = await Transaction.findOne({ externalReference: reference });
  if (existing) {
    return ApiResponse.success(res, {
      status: 'success',
      amount: existing.amount,
      alreadyProcessed: true,
    }, 'Payment already processed');
  }

  const data = await paymentService.paystackVerify(reference);
  if (data.status !== 'success') {
    return ApiResponse.error(res, 'Payment not successful', 400);
  }

  const amountNGN = data.amount / 100;
  const userId = data.metadata?.userId || req.user?._id;

  if (!userId) {
    return ApiResponse.error(res, 'Could not identify user for this payment', 400);
  }

  // Credit wallet (fallback for when webhook misses)
  await paymentService.handlePaystackWebhook('charge.success', {
    reference,
    amount: data.amount,
    metadata: { userId: userId.toString() },
    customer: { email: data.customer?.email },
  });

  return ApiResponse.success(res, {
    status: 'success',
    amount: amountNGN,
  }, `₦${amountNGN.toLocaleString()} added to your wallet`);
};

const paystackWebhook = async (req, res) => {
  const signature = req.headers['x-paystack-signature'];

  // In dev mode without a real webhook secret, allow through for testing
  if (process.env.PAYSTACK_WEBHOOK_SECRET &&
      process.env.PAYSTACK_WEBHOOK_SECRET !== 'borhs_paystack_webhook_secret' &&
      !paymentService.verifyPaystackWebhook(signature, req.body)) {
    logger.warn('Invalid Paystack webhook signature');
    return res.status(400).json({ success: false });
  }

  res.status(200).json({ success: true });

  const { event, data } = req.body;
  await paymentService.handlePaystackWebhook(event, data).catch((e) =>
    logger.error('Paystack webhook handler error:', e)
  );
};

const initializeFlutterwave = async (req, res) => {
  const { amount } = req.body;
  if (amount < 100) return ApiResponse.error(res, 'Minimum funding amount is ₦100');
  const data = await paymentService.flutterwaveInitialize(
    req.user._id,
    req.user.email,
    Number(amount),
    req.user.fullName,
    req.user.phone
  );
  return ApiResponse.success(res, data, 'Payment initialized');
};

const verifyFlutterwave = async (req, res) => {
  const { transaction_id } = req.params;

  const existing = await Transaction.findOne({
    'metadata.tx_ref': req.query.tx_ref,
    status: 'success',
  });
  if (existing) {
    return ApiResponse.success(res, { status: 'success', amount: existing.amount, alreadyProcessed: true }, 'Already processed');
  }

  const data = await paymentService.flutterwaveVerify(transaction_id);
  if (data.status !== 'successful') {
    return ApiResponse.error(res, 'Payment not successful', 400);
  }

  await paymentService.handleFlutterwaveWebhook('charge.completed', {
    status: 'successful',
    tx_ref: data.tx_ref,
    amount: data.amount,
    meta: { userId: data.meta?.userId || req.user?._id?.toString() },
  });

  return ApiResponse.success(res, { status: 'success', amount: data.amount }, `₦${data.amount.toLocaleString()} added to your wallet`);
};

const flutterwaveWebhook = async (req, res) => {
  const signature = req.headers['verif-hash'];
  if (!paymentService.verifyFlutterwaveWebhook(signature)) {
    logger.warn('Invalid Flutterwave webhook signature');
    return res.status(400).json({ success: false });
  }
  res.status(200).json({ success: true });
  const { event, data } = req.body;
  await paymentService.handleFlutterwaveWebhook(event, data).catch((e) =>
    logger.error('Flutterwave webhook handler error:', e)
  );
};

module.exports = {
  initializePaystack, verifyPaystack, paystackWebhook,
  initializeFlutterwave, verifyFlutterwave, flutterwaveWebhook,
};
