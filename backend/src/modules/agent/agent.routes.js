const express = require('express');
const router = express.Router();
const ctrl = require('./agent.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('express-async-handler');

router.use(authenticate);
router.use(authorize('agent', 'admin', 'super_admin'));

router.get('/stats', asyncHandler(ctrl.getStats));
router.get('/downlines', asyncHandler(ctrl.getDownlines));
router.get('/commissions', asyncHandler(ctrl.getCommissions));

module.exports = router;
