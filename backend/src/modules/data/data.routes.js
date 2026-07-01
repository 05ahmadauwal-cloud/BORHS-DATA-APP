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

module.exports = router;
