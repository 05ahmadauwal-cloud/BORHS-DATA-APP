const airtimeService = require('./airtime.service');
const ApiResponse = require('../../utils/apiResponse');

const purchase = async (req, res) => {
  const result = await airtimeService.purchaseAirtime(req.user._id, req.body);
  return ApiResponse.success(res, { purchase: result }, 'Airtime purchase successful');
};

const purchaseBulk = async (req, res) => {
  const results = await airtimeService.purchaseBulkAirtime(req.user._id, req.body.recipients);
  return ApiResponse.success(res, { results }, 'Bulk airtime processed');
};

const getHistory = async (req, res) => {
  const data = await airtimeService.getAirtimeHistory(req.user._id, req.query);
  return ApiResponse.success(res, data);
};

module.exports = { purchase, purchaseBulk, getHistory };
