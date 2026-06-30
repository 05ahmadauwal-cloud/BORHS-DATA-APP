const agentService = require('./agent.service');
const ApiResponse = require('../../utils/apiResponse');

const getStats = async (req, res) => {
  const data = await agentService.getAgentStats(req.user._id);
  return ApiResponse.success(res, data);
};

const getDownlines = async (req, res) => {
  const data = await agentService.getAgentDownlines(req.user._id, req.query);
  return ApiResponse.success(res, data);
};

const getCommissions = async (req, res) => {
  const data = await agentService.getCommissionHistory(req.user._id, req.query);
  return ApiResponse.success(res, data);
};

module.exports = { getStats, getDownlines, getCommissions };
