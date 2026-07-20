const paymentService = require('./payment.service');
const Transaction = require('../../models/Transaction');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

const initializePaystack = async (req, res) => {
  const Settings = require('../../models/Settings');
  const enabled = await Settings.get('funding_paystack', true);
  if (enabled === false) return ApiResponse.error(res, 'Paystack payments are currently disabled', 403);
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
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);

  if (!paymentService.verifyPaystackWebhook(signature, rawBody)) {
    logger.warn('Invalid Paystack webhook signature');
    return res.status(400).json({ success: false });
  }

  res.status(200).json({ success: true });

  const { event, data } = JSON.parse(rawBody);
  await paymentService.handlePaystackWebhook(event, data).catch((e) =>
    logger.error('Paystack webhook handler error:', e)
  );
};

const getOrCreatePaystackAccount = async (req, res) => {
  const Settings = require('../../models/Settings');
  const enabled = await Settings.get('funding_paystack', true);
  if (enabled === false) return ApiResponse.error(res, 'Paystack payments are currently disabled', 403);
  if (!process.env.PAYSTACK_SECRET_KEY) return ApiResponse.error(res, 'Paystack is not configured', 503);

  const User = require('../../models/User');
  let user = await User.findById(req.user._id);
  if (user.paystackVirtualAccount?.assignmentStatus === 'active') {
    return ApiResponse.success(res, { virtualAccount: user.paystackVirtualAccount });
  }
  if (user.paystackVirtualAccount?.assignmentStatus === 'pending') {
    return ApiResponse.success(res, { virtualAccount: user.paystackVirtualAccount, pending: true }, 'Paystack account assignment is in progress');
  }

  try {
    const { assignDedicatedAccount } = require('../../services/paystack');
    const result = await assignDedicatedAccount(user, req.body);
    user = await User.findByIdAndUpdate(req.user._id, {
      'paystackVirtualAccount.assignmentStatus': 'pending',
      'paystackVirtualAccount.consentedAt': new Date(),
      'paystackVirtualAccount.failureReason': null,
    }, { new: true });
    return ApiResponse.success(res, {
      virtualAccount: user.paystackVirtualAccount,
      pending: true,
      providerMessage: result.message,
    }, 'Paystack account assignment is in progress');
  } catch (error) {
    const reason = error.response?.data?.message || error.message;
    logger.error('Paystack DVA assignment failed:', error.response?.data || error.message);
    await User.findByIdAndUpdate(req.user._id, {
      'paystackVirtualAccount.assignmentStatus': 'failed',
      'paystackVirtualAccount.failureReason': reason,
      'paystackVirtualAccount.consentedAt': new Date(),
    });
    return ApiResponse.error(res, reason || 'Paystack account is not available yet', error.response?.status || 503);
  }
};

const getPaystackAccount = async (req, res) => {
  const User = require('../../models/User');
  const user = await User.findById(req.user._id).select('paystackVirtualAccount');
  return ApiResponse.success(res, { virtualAccount: user?.paystackVirtualAccount || null });
};

const getPaystackBanks = async (_req, res) => {
  const { listBanks } = require('../../services/paystack');
  const banks = await listBanks();
  return ApiResponse.success(res, { banks });
};

const initializeFlutterwave = async (req, res) => {
  const Settings = require('../../models/Settings');
  const enabled = await Settings.get('funding_flutterwave', true);
  if (enabled === false) return ApiResponse.error(res, 'Flutterwave payments are currently disabled', 403);
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

// ─── Monnify ─────────────────────────────────────────────────────────────────
const monnifyWebhook = async (req, res) => {
  // Acknowledge immediately — process async
  res.status(200).json({ success: true });

  const signature = req.headers['monnify-signature'];
  // rawBody is the raw buffer set by express.raw()
  const rawBody = req.rawBody || JSON.stringify(req.body);

  await paymentService.handleMonnifyWebhook(rawBody, signature).catch((e) =>
    logger.error('Monnify webhook error:', e.message)
  );
};

const getOrCreateVirtualAccount = async (req, res) => {
  const Settings = require('../../models/Settings');
  const enabled = await Settings.get('funding_bank_transfer', true);
  if (enabled === false) return ApiResponse.error(res, 'Bank transfer is currently disabled', 403);
  const User = require('../../models/User');
  let user = await User.findById(req.user._id);

  if (!user.monnifyVirtualAccount?.reference) {
    // Create on demand if missing
    if (process.env.MONNIFY_API_KEY && process.env.MONNIFY_CONTRACT_CODE) {
      try {
        const { createReservedAccount } = require('../../services/monnify');
        const va = await createReservedAccount(user);
        user = await User.findByIdAndUpdate(req.user._id, { monnifyVirtualAccount: va }, { new: true });
      } catch (e) {
        logger.error('Monnify on-demand account creation failed:', e.response?.data || e.message);
        return ApiResponse.error(res, 'Virtual account not available yet. Please try again later.', 503);
      }
    } else {
      return ApiResponse.error(res, 'Bank transfer not configured', 503);
    }
  }

  return ApiResponse.success(res, { virtualAccount: user.monnifyVirtualAccount });
};

const getOrCreateBillstackAccount = async (req, res) => {
  const Settings = require('../../models/Settings');
  const enabled = await Settings.get('funding_billstack', false);
  if (enabled === false) return ApiResponse.error(res, 'Billstack payments are currently disabled', 403);

  const User = require('../../models/User');
  let user = await User.findById(req.user._id);
  if (!user.billstackVirtualAccount?.reference) {
    try {
      const { createReservedAccount } = require('../../services/billstack');
      const account = await createReservedAccount(user);
      user = await User.findByIdAndUpdate(req.user._id, { billstackVirtualAccount: account }, { new: true });
    } catch (error) {
      logger.error('Billstack account creation failed:', error.response?.data || error.message);
      return ApiResponse.error(res, 'Billstack account is not available yet. Please try again later.', 503);
    }
  }
  return ApiResponse.success(res, { virtualAccount: user.billstackVirtualAccount });
};

const billstackWebhook = async (req, res) => {
  const signature = req.headers['x-wiaxy-signature'];
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);

  try {
    await paymentService.handleBillstackWebhook(rawBody, signature);
    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Billstack webhook error:', error.message);
    return res.status(error.statusCode || 400).json({ success: false });
  }
};

module.exports = {
  initializePaystack, verifyPaystack, paystackWebhook, getOrCreatePaystackAccount, getPaystackAccount, getPaystackBanks,
  initializeFlutterwave, verifyFlutterwave, flutterwaveWebhook,
  monnifyWebhook, getOrCreateVirtualAccount,
  billstackWebhook, getOrCreateBillstackAccount,
};
