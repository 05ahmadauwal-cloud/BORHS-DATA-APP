const electricityService = require('./electricity.service');
const ApiResponse = require('../../utils/apiResponse');

const verifyMeter = async (req, res) => {
  const { provider, meterNumber, meterType } = req.body;
  const data = await electricityService.verifyMeter(provider, meterNumber, meterType);
  return ApiResponse.success(res, { customer: data }, 'Meter verified');
};

const purchase = async (req, res) => {
  const result = await electricityService.purchaseElectricity(req.user._id, req.body);
  return ApiResponse.success(res, { purchase: result }, 'Electricity purchase successful');
};

const getHistory = async (req, res) => {
  const data = await electricityService.getElectricityHistory(req.user._id, req.query);
  return ApiResponse.success(res, data);
};

module.exports = { verifyMeter, purchase, getHistory };
