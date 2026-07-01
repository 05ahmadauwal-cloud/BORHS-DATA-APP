const express = require('express');
const router = express.Router();
const ctrl = require('./agent.controller');
const agentService = require('./agent.service');
const { authenticate, authorize } = require('../../middleware/auth');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('express-async-handler');

router.use(authenticate);

// Public to all authenticated users — get current agent fee
router.get('/fee', asyncHandler(async (req, res) => {
  const fee = await agentService.getAgentFee();
  return ApiResponse.success(res, { fee });
}));

// Get my application status
router.get('/application', asyncHandler(async (req, res) => {
  const data = await agentService.getMyApplication(req.user._id);
  return ApiResponse.success(res, data);
}));

// Submit agent application (any authenticated user)
router.post('/apply', asyncHandler(async (req, res) => {
  const data = await agentService.applyForAgent(req.user._id);
  return ApiResponse.success(res, data, 'Application submitted successfully');
}));

// Agent-only routes
router.use(authorize('agent', 'admin', 'super_admin'));
router.get('/stats', asyncHandler(ctrl.getStats));
router.get('/downlines', asyncHandler(ctrl.getDownlines));
router.get('/commissions', asyncHandler(ctrl.getCommissions));

module.exports = router;
