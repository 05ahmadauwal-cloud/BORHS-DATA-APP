const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('./payment.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const asyncHandler = require('express-async-handler');

// Webhooks (no auth) — Monnify needs raw body for HMAC verification
router.post('/webhook/paystack', express.raw({ type: 'application/json' }), asyncHandler(ctrl.paystackWebhook));
router.post('/webhook/flutterwave', asyncHandler(ctrl.flutterwaveWebhook));
router.post('/webhook/billstack', asyncHandler(ctrl.billstackWebhook));
router.post(
  '/webhook/monnify',
  express.raw({ type: 'application/json' }),
  (req, _res, next) => { req.rawBody = req.body.toString('utf8'); next(); },
  asyncHandler(ctrl.monnifyWebhook)
);

// Protected
router.use(authenticate);
router.post('/paystack/initialize', [body('amount').isNumeric().toFloat()], validate, asyncHandler(ctrl.initializePaystack));
router.get('/paystack/verify/:reference', asyncHandler(ctrl.verifyPaystack));
router.get('/paystack/dedicated-account', asyncHandler(ctrl.getPaystackAccount));
router.get('/paystack/banks', asyncHandler(ctrl.getPaystackBanks));
router.post('/paystack/dedicated-account', [
  body('consent').equals('true').withMessage('Consent is required to create a dedicated account'),
  body('bvn').optional({ checkFalsy: true }).isLength({ min: 11, max: 11 }).isNumeric(),
  body('accountNumber').optional({ checkFalsy: true }).isLength({ min: 10, max: 10 }).isNumeric(),
  body('bankCode').optional({ checkFalsy: true }).isString(),
], validate, asyncHandler(ctrl.getOrCreatePaystackAccount));
router.post('/flutterwave/initialize', [body('amount').isNumeric().toFloat()], validate, asyncHandler(ctrl.initializeFlutterwave));
router.get('/flutterwave/verify/:transaction_id', asyncHandler(ctrl.verifyFlutterwave));
router.get('/virtual-account', asyncHandler(ctrl.getOrCreateVirtualAccount));
router.get('/billstack/virtual-account', asyncHandler(ctrl.getOrCreateBillstackAccount));

module.exports = router;
