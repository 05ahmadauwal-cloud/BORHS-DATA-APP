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
router.post('/flutterwave/initialize', [body('amount').isNumeric().toFloat()], validate, asyncHandler(ctrl.initializeFlutterwave));
router.get('/flutterwave/verify/:transaction_id', asyncHandler(ctrl.verifyFlutterwave));
router.get('/virtual-account', asyncHandler(ctrl.getOrCreateVirtualAccount));

module.exports = router;
