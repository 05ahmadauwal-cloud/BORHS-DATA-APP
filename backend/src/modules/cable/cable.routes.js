const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('./cable.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const asyncHandler = require('express-async-handler');

const PROVIDERS = ['dstv', 'gotv', 'startimes'];

router.use(authenticate);
router.get('/packages', asyncHandler(ctrl.getPackages));
router.get('/history', asyncHandler(ctrl.getHistory));

router.post('/verify', [
  body('provider').isIn(PROVIDERS).withMessage('Invalid provider'),
  body('smartCardNumber').notEmpty().withMessage('Smart card number is required'),
], validate, asyncHandler(ctrl.verifySmartCard));

router.post('/purchase', [
  body('provider').isIn(PROVIDERS).withMessage('Invalid provider'),
  body('smartCardNumber').notEmpty().withMessage('Smart card number is required'),
  body('packageId').notEmpty().withMessage('Package is required'),
], validate, asyncHandler(ctrl.purchase));

module.exports = router;
