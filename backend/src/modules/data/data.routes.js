const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('./data.controller');
const { authenticate } = require('../../middleware/auth');
const requireKYC = require('../../middleware/requireKYC');
const validate = require('../../middleware/validate');
const asyncHandler = require('express-async-handler');

router.use(authenticate);

router.get('/plans', asyncHandler(ctrl.getPlans));
router.get('/history', asyncHandler(ctrl.getHistory));

router.post('/purchase', requireKYC, [
  body('network').isIn(['mtn', 'airtel', 'glo', '9mobile']).withMessage('Invalid network'),
  body('planId').notEmpty().withMessage('Plan ID is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
], validate, asyncHandler(ctrl.purchase));

router.post('/purchase/bulk', requireKYC, [
  body('recipients').isArray({ min: 1 }).withMessage('At least one recipient is required'),
  body('recipients.*.network').isIn(['mtn', 'airtel', 'glo', '9mobile']).withMessage('Invalid network'),
  body('recipients.*.planId').notEmpty().withMessage('Plan is required'),
  body('recipients.*.phone').matches(/^0\d{10}$/).withMessage('Each phone number must be 11 digits'),
  body('pin').matches(/^\d{4}$/).withMessage('Transaction PIN must be a 4-digit code'),
], validate, asyncHandler(ctrl.purchaseBulk));

module.exports = router;
