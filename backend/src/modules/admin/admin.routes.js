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

// ─── Agent Applications ───────────────────────────────────────────────────────
const agentService = require('../agent/agent.service');

router.get('/agent-applications', asyncHandler(async (req, res) => {
  const data = await agentService.getAgentApplications(req.query);
  return ApiResponse.success(res, data);
}));

router.get('/agent-applications/counts', asyncHandler(async (req, res) => {
  const counts = await agentService.getAgentApplicationCounts();
  return ApiResponse.success(res, counts);
}));

router.patch('/agent-applications/:id/review', asyncHandler(async (req, res) => {
  const { action, rejectionReason } = req.body;
  if (!['approve', 'reject'].includes(action)) {
    return ApiResponse.error(res, 'Action must be approve or reject', 400);
  }
  const data = await agentService.reviewAgentApplication(req.user._id, req.params.id, action, rejectionReason);
  return ApiResponse.success(res, { application: data }, `Application ${action}d successfully`);
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

// ─── Email Test ───────────────────────────────────────────────────────────────
router.get('/test/email', asyncHandler(async (req, res) => {
  try {
    const { testConnection, sendEmail } = require('../../services/emailService');
    const info = await testConnection();
    const to = req.query.to || req.user.email;
    const sent = await sendEmail(to, 'otp', { firstName: 'Admin', otp: '123456' });
    return ApiResponse.success(res, { smtp: info, emailSent: sent, sentTo: to }, sent ? 'Test email sent!' : 'SMTP connected but email failed to send');
  } catch (err) {
    return ApiResponse.error(res, `SMTP error: ${err.message}`, 400, {
      smtpUser: process.env.SMTP_USER || 'NOT SET',
      smtpHost: process.env.SMTP_HOST || 'NOT SET',
      smtpPassSet: !!process.env.SMTP_PASS,
    });
  }
}));

// ─── Monnify Health Check ─────────────────────────────────────────────────────
router.get('/test/monnify', asyncHandler(async (req, res) => {
  try {
    const { syncMonnifyKYC } = require('../kyc/kyc.service');
    const User = require('../../models/User');
    const user = await User.findById(req.user._id);
    const result = await syncMonnifyKYC(user._id);
    if (result.skipped) return ApiResponse.error(res, 'Approved BVN or NIN is required', 400);
    const updated = await User.findById(user._id);
    const va = updated.monnifyVirtualAccount;
    return ApiResponse.success(res, { virtualAccount: va }, 'Monnify connected ✓ Virtual account created');
  } catch (err) {
    const detail = err.response?.data || err.message;
    return ApiResponse.error(res, `Monnify error: ${JSON.stringify(detail)}`, 400, detail);
  }
}));

// Force-create virtual account for a specific user (admin tool)
router.post('/users/:id/create-virtual-account', asyncHandler(async (req, res) => {
  const User = require('../../models/User');
  const { syncMonnifyKYC } = require('../kyc/kyc.service');
  try {
    const user = await User.findById(req.params.id);
    if (!user) return ApiResponse.error(res, 'User not found', 404);
    const result = await syncMonnifyKYC(user._id);
    if (result.skipped) return ApiResponse.error(res, 'User needs approved BVN or NIN', 400);
    const updated = await User.findById(user._id);
    const va = updated.monnifyVirtualAccount;
    return ApiResponse.success(res, { virtualAccount: va }, 'Virtual account created');
  } catch (err) {
    const detail = err.response?.data || err.message;
    return ApiResponse.error(res, `Monnify error: ${JSON.stringify(detail)}`, 400, detail);
  }
}));

// ─── Provider Health Check ────────────────────────────────────────────────────
router.get('/test/smeapi', asyncHandler(async (req, res) => {
  try {
    const smeapi = require('../../services/providers/smeapi');
    const data = await smeapi.checkBalance();
    return ApiResponse.success(res, { provider: 'smeapi', data }, 'SMEAPI reachable');
  } catch (err) {
    return ApiResponse.error(res, `SMEAPI error: ${err.message}`, 400);
  }
}));

router.get('/test/smeapi-plans/:network', asyncHandler(async (req, res) => {
  try {
    const smeapi = require('../../services/providers/smeapi');
    const plans = await smeapi.getDataVariations(req.params.network);
    return ApiResponse.success(res, { plans, count: plans.length });
  } catch (err) {
    return ApiResponse.error(res, `Failed: ${err.message}`, 400);
  }
}));

// ─── SMEAPI Sync ──────────────────────────────────────────────────────────────
const { syncDataPlans, updateAllCommissions } = require('./sync.service');

// Sync data plans from SMEAPI with current commission rates
router.post('/sync/data-plans', asyncHandler(async (req, res) => {
  const result = await syncDataPlans(req.body.commissionRates || {});
  return ApiResponse.success(res, result, `Synced ${result.synced} data plans from SMEAPI`);
}));

// Update commission rates across all existing plans
router.post('/sync/update-commissions', [
  body('customer').isNumeric().toFloat().withMessage('Customer commission % required'),
  body('agent').isNumeric().toFloat().withMessage('Agent commission % required'),
  body('reseller').isNumeric().toFloat().withMessage('Reseller commission % required'),
], validate, asyncHandler(async (req, res) => {
  const { customer, agent, reseller } = req.body;
  const result = await updateAllCommissions({ customer, agent, reseller });
  return ApiResponse.success(res, result, `Updated prices for ${result.updated} plans`);
}));

// Get current commission settings
router.get('/sync/commission-rates', asyncHandler(async (req, res) => {
  const Settings = require('../../models/Settings');
  const rates = await Settings.getMany([
    'commission_customer',
    'commission_agent',
    'commission_reseller',
  ]);
  return ApiResponse.success(res, {
    customer: parseFloat(rates.commission_customer ?? 10),
    agent: parseFloat(rates.commission_agent ?? 5),
    reseller: parseFloat(rates.commission_reseller ?? 3),
  });
}));

// ─── Broadcast Announcement ───────────────────────────────────────────────────
router.post('/broadcast', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('targetRole').optional().isIn(['all', 'customer', 'agent']),
], validate, asyncHandler(async (req, res) => {
  const User = require('../../models/User');
  const Notification = require('../../models/Notification');

  const { title, message, targetRole = 'all' } = req.body;

  const filter = { isActive: true };
  if (targetRole !== 'all') filter.role = targetRole;

  const users = await User.find(filter).select('_id').lean();
  if (!users.length) return ApiResponse.error(res, 'No users found for target', 400);

  const docs = users.map((u) => ({
    user: u._id,
    title,
    message,
    type: 'in_app',
    event: 'announcement',
    metadata: { sentBy: req.user._id, targetRole },
  }));

  await Notification.insertMany(docs, { ordered: false });

  return ApiResponse.success(res, { sent: docs.length }, `Announcement sent to ${docs.length} user(s)`);
}));

// List past announcements (distinct — one sample per broadcast batch)
router.get('/broadcast/history', asyncHandler(async (req, res) => {
  const Notification = require('../../models/Notification');
  const history = await Notification.aggregate([
    { $match: { event: 'announcement' } },
    { $sort: { createdAt: -1 } },
    { $group: {
      _id: { title: '$title', message: '$message', sentBy: '$metadata.sentBy' },
      sentAt: { $first: '$createdAt' },
      count: { $sum: 1 },
      targetRole: { $first: '$metadata.targetRole' },
    }},
    { $sort: { sentAt: -1 } },
    { $limit: 20 },
  ]);
  return ApiResponse.success(res, { history });
}));

module.exports = router;
