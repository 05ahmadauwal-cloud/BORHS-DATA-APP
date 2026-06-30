const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('./education.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const asyncHandler = require('express-async-handler');

router.use(authenticate);
router.get('/prices', asyncHandler(ctrl.getPrices));
router.get('/history', asyncHandler(ctrl.getHistory));

router.post('/purchase', [
  body('examType').isIn(['waec', 'neco', 'nabteb', 'jamb']).withMessage('Invalid exam type'),
  body('quantity').optional().isInt({ min: 1, max: 10 }).toInt(),
], validate, asyncHandler(ctrl.purchase));

module.exports = router;
