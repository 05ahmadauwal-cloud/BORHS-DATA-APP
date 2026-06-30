const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const asyncHandler = require('express-async-handler');
const referralService = require('./referral.service');
const ApiResponse = require('../../utils/apiResponse');

router.use(authenticate);

router.get('/stats', asyncHandler(async (req, res) => {
  const data = await referralService.getReferralStats(req.user._id);
  return ApiResponse.success(res, data);
}));

router.get('/tree', asyncHandler(async (req, res) => {
  const data = await referralService.getReferralTree(req.user._id);
  return ApiResponse.success(res, data);
}));

module.exports = router;
