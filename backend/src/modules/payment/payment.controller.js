const paymentService = require('./payment.service');
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

const verifyPaystack = async (req, res) => {
  const { reference } = req.params;
  const data = await paymentService.paystackVerify(reference);
  if (data.status === 'success') {
    return ApiResponse.success(res, { status: 'success', amount: data.amount / 100 }, 'Payment verified');
  }
  return ApiResponse.error(res, 'Payment verification failed', 400);
};

const paystackWebhook = async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  if (!paymentService.verifyPaystackWebhook(signature, req.body)) {
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

module.exports = { initializePaystack, verifyPaystack, paystackWebhook, initializeFlutterwave, flutterwaveWebhook };
