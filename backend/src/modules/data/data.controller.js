const dataService = require('./data.service');
const ApiResponse = require('../../utils/apiResponse');

const getPlans = async (req, res) => {
  const { network, dataType } = req.query;
  const plans = await dataService.getDataPlans(network, dataType);
  return ApiResponse.success(res, { plans });
};

const purchase = async (req, res) => {
  const result = await dataService.purchaseData(req.user._id, req.body);
  return ApiResponse.success(res, { purchase: result }, 'Data purchase successful');
};

const purchaseBulk = async (req, res) => {
  const results = await dataService.purchaseBulkData(req.user._id, req.body.recipients, req.body.pin, req.body.paymentSource);
  return ApiResponse.success(res, { results }, 'Bulk data processed');
};

const getHistory = async (req, res) => {
  const data = await dataService.getDataHistory(req.user._id, req.query);
  return ApiResponse.success(res, data);
};

module.exports = { getPlans, purchase, purchaseBulk, getHistory };
