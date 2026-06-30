const educationService = require('./education.service');
const ApiResponse = require('../../utils/apiResponse');

const getPrices = async (req, res) => {
  return ApiResponse.success(res, { prices: educationService.getExamPrices() });
};

const purchase = async (req, res) => {
  const result = await educationService.purchaseExamPin(req.user._id, req.body);
  return ApiResponse.success(res, { purchase: result }, 'Exam PIN purchase successful');
};

const getHistory = async (req, res) => {
  const data = await educationService.getEducationHistory(req.user._id, req.query);
  return ApiResponse.success(res, data);
};

module.exports = { getPrices, purchase, getHistory };
