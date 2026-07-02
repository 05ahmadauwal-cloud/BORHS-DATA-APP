const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('./wallet.controller');
const { authenticate } = require('../../middleware/auth');
const requireKYC = require('../../middleware/requireKYC');
const validate = require('../../middleware/validate');
const asyncHandler = require('express-async-handler');

router.use(authenticate);

router.get('/balance', asyncHandler(ctrl.getBalance));
router.get('/transactions', asyncHandler(ctrl.getTransactions));

router.post('/transfer', requireKYC, [
  body('recipient').notEmpty().withMessage('Recipient is required'),
  body('amount').isNumeric().withMessage('Amount must be a number').toFloat(),
  body('pin').optional().isLength({ min: 4, max: 4 }),
], validate, asyncHandler(ctrl.transfer));

router.post('/set-pin', [
  body('pin').isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits').isNumeric(),
], validate, asyncHandler(ctrl.setPin));

router.post('/reset-pin', [
  body('password').notEmpty().withMessage('Current password is required'),
  body('newPin').isLength({ min: 4, max: 4 }).withMessage('New PIN must be 4 digits').isNumeric(),
], validate, asyncHandler(ctrl.resetPin));

module.exports = router;
