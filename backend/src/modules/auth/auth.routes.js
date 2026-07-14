const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const asyncHandler = require('express-async-handler');

const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and number'),
  body('username')
    .optional()
    .trim()
    .matches(/^[a-z0-9_]{3,20}$/i)
    .withMessage('Username must be 3–20 characters (letters, numbers, underscore only)'),
];

const loginRules = [
  body('identifier').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerRules, validate, asyncHandler(ctrl.register));
router.post('/login', loginRules, validate, asyncHandler(ctrl.login));
router.post('/logout', asyncHandler(ctrl.logout));
router.post('/refresh-token', asyncHandler(ctrl.refreshToken));
router.get('/verify-email/:token', asyncHandler(ctrl.verifyEmail));
router.post('/forgot-password', body('email').isEmail(), validate, asyncHandler(ctrl.forgotPassword));
router.post('/reset-password/:token', [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, asyncHandler(ctrl.resetPassword));

// Protected routes
router.use(authenticate);
router.get('/me', asyncHandler(ctrl.getMe));
router.post('/send-phone-otp', asyncHandler(ctrl.sendPhoneOTP));
router.post('/verify-phone-otp', body('otp').isLength({ min: 6, max: 6 }), validate, asyncHandler(ctrl.verifyPhoneOTP));
router.post('/change-password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
], validate, asyncHandler(ctrl.changePassword));
router.patch('/username', [
  body('username')
    .trim()
    .matches(/^[a-z0-9_]{3,20}$/i)
    .withMessage('Username must be 3–20 characters (letters, numbers, underscore only)'),
], validate, asyncHandler(ctrl.updateUsername));

module.exports = router;
