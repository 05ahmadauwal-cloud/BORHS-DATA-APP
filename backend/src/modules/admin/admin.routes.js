const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminService = require('./admin.service');
const { authenticate, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('express-async-handler');

router.use(authenticate);
router.use(authorize('admin', 'super_admin'));

// Analytics
router.get('/analytics', asyncHandler(async (req, res) => {
  const data = await adminService.getAnalytics(req.query.period);
  return ApiResponse.success(res, data);
}));

// Users
router.get('/users', asyncHandler(async (req, res) => {
  const data = await adminService.getUsers(req.query);
  return ApiResponse.success(res, data);
}));

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await adminService.getUserById(req.params.id);
  return ApiResponse.success(res, { user });
}));

router.patch('/users/:id', asyncHandler(async (req, res) => {
  const user = await adminService.updateUser(req.params.id, req.body);
  return ApiResponse.success(res, { user }, 'User updated');
}));

router.patch('/users/:id/suspend', [
  body('reason').notEmpty().withMessage('Reason is required'),
], validate, asyncHandler(async (req, res) => {
  const user = await adminService.suspendUser(req.params.id, req.body.reason, req.user._id);
  return ApiResponse.success(res, { user }, 'User suspended');
}));

router.patch('/users/:id/activate', asyncHandler(async (req, res) => {
  const user = await adminService.activateUser(req.params.id);
  return ApiResponse.success(res, { user }, 'User activated');
}));

router.post('/users/:id/adjust-wallet', [
  body('amount').isNumeric().toFloat(),
  body('type').isIn(['credit', 'debit']),
  body('reason').notEmpty(),
], validate, asyncHandler(async (req, res) => {
  const data = await adminService.adjustWallet(req.user._id, req.params.id, req.body.amount, req.body.type, req.body.reason);
  return ApiResponse.success(res, data, 'Wallet adjusted');
}));

// Transactions
router.get('/transactions', asyncHandler(async (req, res) => {
  const data = await adminService.getTransactions(req.query);
  return ApiResponse.success(res, data);
}));

router.patch('/transactions/:id/reverse', [
  body('reason').notEmpty(),
], validate, asyncHandler(async (req, res) => {
  const data = await adminService.reverseTransaction(req.user._id, req.params.id, req.body.reason);
  return ApiResponse.success(res, data, 'Transaction reversed');
}));

// Data Plans
router.get('/data-plans', asyncHandler(async (req, res) => {
  const plans = await adminService.getDataPlans(req.query);
  return ApiResponse.success(res, { plans });
}));

router.post('/data-plans', asyncHandler(async (req, res) => {
  const plan = await adminService.createDataPlan(req.body);
  return ApiResponse.created(res, { plan }, 'Data plan created');
}));

router.patch('/data-plans/:id', asyncHandler(async (req, res) => {
  const plan = await adminService.updateDataPlan(req.params.id, req.body);
  return ApiResponse.success(res, { plan }, 'Data plan updated');
}));

router.delete('/data-plans/:id', asyncHandler(async (req, res) => {
  await adminService.deleteDataPlan(req.params.id);
  return ApiResponse.success(res, {}, 'Data plan deleted');
}));

// Settings
router.get('/settings', asyncHandler(async (req, res) => {
  const settings = await adminService.getSettings();
  return ApiResponse.success(res, { settings });
}));

router.patch('/settings', asyncHandler(async (req, res) => {
  const settings = await adminService.updateSettings(req.user._id, req.body);
  return ApiResponse.success(res, { settings }, 'Settings updated');
}));

module.exports = router;
