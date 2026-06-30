const cableService = require('./cable.service');
const ApiResponse = require('../../utils/apiResponse');

const getPackages = async (req, res) => {
  const packages = cableService.getCablePackages(req.query.provider);
  return ApiResponse.success(res, { packages });
};

const verifySmartCard = async (req, res) => {
  const { provider, smartCardNumber } = req.body;
  const data = await cableService.verifySmartCard(provider, smartCardNumber);
  return ApiResponse.success(res, { customer: data }, 'Smart card verified');
};

const purchase = async (req, res) => {
  const result = await cableService.purchaseCable(req.user._id, req.body);
  return ApiResponse.success(res, { purchase: result }, 'Cable subscription successful');
};

const getHistory = async (req, res) => {
  const data = await cableService.getCableHistory(req.user._id, req.query);
  return ApiResponse.success(res, data);
};

module.exports = { getPackages, verifySmartCard, purchase, getHistory };
