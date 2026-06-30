const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('./electricity.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const asyncHandler = require('express-async-handler');

const PROVIDERS = ['ikedc', 'ekedc', 'aedc', 'kedco', 'jed', 'phed'];

router.use(authenticate);
router.get('/history', asyncHandler(ctrl.getHistory));

router.post('/verify-meter', [
  body('provider').isIn(PROVIDERS).withMessage('Invalid provider'),
  body('meterNumber').notEmpty().withMessage('Meter number is required'),
  body('meterType').isIn(['prepaid', 'postpaid']).withMessage('Meter type must be prepaid or postpaid'),
], validate, asyncHandler(ctrl.verifyMeter));

router.post('/purchase', [
  body('provider').isIn(PROVIDERS).withMessage('Invalid provider'),
  body('meterNumber').notEmpty().withMessage('Meter number is required'),
  body('meterType').isIn(['prepaid', 'postpaid']),
  body('amount').isNumeric().toFloat().withMessage('Amount must be a number'),
], validate, asyncHandler(ctrl.purchase));

module.exports = router;
