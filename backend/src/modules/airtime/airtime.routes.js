const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('./airtime.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const asyncHandler = require('express-async-handler');

router.use(authenticate);

router.get('/history', asyncHandler(ctrl.getHistory));

router.post('/purchase', [
  body('network').isIn(['mtn', 'airtel', 'glo', '9mobile']).withMessage('Invalid network'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('amount').isNumeric().toFloat().withMessage('Amount must be a number'),
], validate, asyncHandler(ctrl.purchase));

router.post('/purchase/bulk', [
  body('recipients').isArray({ min: 1, max: 20 }).withMessage('Recipients must be an array of 1-20'),
  body('recipients.*.phone').notEmpty(),
  body('recipients.*.network').isIn(['mtn', 'airtel', 'glo', '9mobile']),
  body('recipients.*.amount').isNumeric().toFloat(),
], validate, asyncHandler(ctrl.purchaseBulk));

module.exports = router;
