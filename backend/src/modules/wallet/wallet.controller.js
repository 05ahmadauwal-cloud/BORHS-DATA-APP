const walletService = require('./wallet.service');
const ApiResponse = require('../../utils/apiResponse');

const getBalance = async (req, res) => {
  const data = await walletService.getWalletBalance(req.user._id);
  return ApiResponse.success(res, data);
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

const setPin = async (req, res) => {
  await walletService.setTransactionPin(req.user._id, req.body.pin);
  return ApiResponse.success(res, {}, 'Transaction PIN set successfully');
};

module.exports = { getBalance, getTransactions, transfer, setPin };
