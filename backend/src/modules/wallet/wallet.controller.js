const walletService = require('./wallet.service');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');


const getBalance = async (req, res) => {
  const data = await walletService.getWalletBalance(req.user._id);
  reconcileMonnifyInBackground(req.user._id);
  return ApiResponse.success(res, data);
};

// Provider reconciliation is useful as a webhook fallback, but it must never
// hold up the dashboard's first paint.
const reconcileMonnifyInBackground = (userId) => {
  const paymentService = require('../payment/payment.service');
  paymentService.reconcileMonnifyUser(userId).catch((error) => {
    logger.warn(`Monnify balance reconciliation skipped for user ${userId}: ${error.message}`);
  });
};

const getDashboard = async (req, res) => {
  const [balance, transactions] = await Promise.all([
    walletService.getWalletBalance(req.user._id),
    walletService.getTransactionHistory(req.user._id, { limit: 5 }),
  ]);

  reconcileMonnifyInBackground(req.user._id);
  return ApiResponse.success(res, {
    balance,
    transactions,
    virtualAccount: req.user.monnifyVirtualAccount || null,
  });
};

const getTransactions = async (req, res) => {
  const data = await walletService.getTransactionHistory(req.user._id, req.query);
  return ApiResponse.success(res, data);
};

const transfer = async (req, res) => {
  const { recipient, amount, pin } = req.body;
  const data = await walletService.transferWallet(req.user._id, recipient, Number(amount), pin);
  return ApiResponse.success(res, data, 'Transfer successful');
};

const transferRewards = async (req, res) => {
  const data = await walletService.transferRewardsToWallet(req.user._id, Number(req.body.amount), req.body.pin);
  return ApiResponse.success(res, data, 'Rewards transferred to main wallet');
};

const setPin = async (req, res) => {
  await walletService.setTransactionPin(req.user._id, req.body.pin);
  return ApiResponse.success(res, {}, 'Transaction PIN set successfully');
};

const resetPin = async (req, res) => {
  await walletService.resetTransactionPin(req.user._id, req.body.password, req.body.newPin);
  return ApiResponse.success(res, {}, 'Transaction PIN reset successfully');
};

module.exports = { getBalance, getDashboard, getTransactions, transfer, transferRewards, setPin, resetPin };
