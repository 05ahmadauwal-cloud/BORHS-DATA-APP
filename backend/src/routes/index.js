const express = require('express');
const router = express.Router();

router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/wallet', require('../modules/wallet/wallet.routes'));
router.use('/payment', require('../modules/payment/payment.routes'));
router.use('/data', require('../modules/data/data.routes'));
router.use('/airtime', require('../modules/airtime/airtime.routes'));
router.use('/electricity', require('../modules/electricity/electricity.routes'));
router.use('/cable', require('../modules/cable/cable.routes'));
router.use('/education', require('../modules/education/education.routes'));
router.use('/agent', require('../modules/agent/agent.routes'));
router.use('/referral', require('../modules/referral/referral.routes'));
router.use('/kyc', require('../modules/kyc/kyc.routes'));
router.use('/notifications', require('../modules/notification/notification.routes'));
router.use('/admin', require('../modules/admin/admin.routes'));
router.use('/coupons', require('../modules/coupon/coupon.routes'));

// Public featured data plans — for homepage price display (no auth)
router.get('/featured-plans', async (req, res) => {
  const DataPlan = require('../models/DataPlan');
  const plans = await DataPlan.find({ isActive: true })
    .sort({ network: 1, sellingPrice: 1 })
    .select('network dataType name dataSize sellingPrice validity')
    .lean();
  res.json({ success: true, data: plans });
});

// Public platform stats — user count, transaction volume (no auth)
router.get('/public-stats', async (req, res) => {
  const User = require('../models/User');
  const Transaction = require('../models/Transaction');
  const [userCount, txResult] = await Promise.all([
    User.countDocuments({ role: { $in: ['customer', 'agent'] } }),
    Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, count: { $sum: 1 }, volume: { $sum: '$amount' } } },
    ]),
  ]);
  const tx = txResult[0] || { count: 0, volume: 0 };
  res.json({ success: true, data: { userCount, txCount: tx.count, volumeProcessed: tx.volume } });
});

// Public banner — no auth needed
router.get('/banner', async (req, res) => {
  const Settings = require('../models/Settings');
  const [text, active, color] = await Promise.all([
    Settings.get('banner_text', ''),
    Settings.get('banner_active', false),
    Settings.get('banner_color', 'primary'),
  ]);
  res.json({ success: true, data: { text, active: !!active, color } });
});

// Public funding methods — which payment channels are enabled
router.get('/funding-methods', async (req, res) => {
  const Settings = require('../models/Settings');
  const [bankTransfer, paystack, flutterwave] = await Promise.all([
    Settings.get('funding_bank_transfer', true),
    Settings.get('funding_paystack', true),
    Settings.get('funding_flutterwave', true),
  ]);
  res.json({
    success: true,
    data: {
      bankTransfer: bankTransfer !== false,
      paystack: paystack !== false,
      flutterwave: flutterwave !== false,
    },
  });
});

// Public deposit charge info — no auth needed (so frontend can show fee preview before login)
router.get('/deposit-charge', async (req, res) => {
  const Settings = require('../models/Settings');
  const [type, value] = await Promise.all([
    Settings.get('deposit_charge_type', 'none'),
    Settings.get('deposit_charge_value', 0),
  ]);
  res.json({ success: true, data: { type: type || 'none', value: parseFloat(value) || 0 } });
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'BORHS VTU API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Test provider credentials — development only
if (process.env.NODE_ENV !== 'production') {
  router.get('/test/smeapi-balance', async (req, res) => {
    try {
      const smeapi = require('../services/providers/smeapi');
      const data = await smeapi.checkBalance();
      res.json({ success: true, provider: 'smeapi', data });
    } catch (err) {
      res.status(400).json({ success: false, provider: 'smeapi', message: err.message });
    }
  });
}

// Public SMTP diagnostic — no auth needed
router.get('/test/smtp', async (req, res) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';

  if (!smtpUser || !smtpPass) {
    return res.status(500).json({
      ok: false,
      error: 'SMTP env vars not set on this server',
      SMTP_USER: smtpUser || 'NOT SET',
      SMTP_HOST: smtpHost,
      SMTP_PASS_SET: !!smtpPass,
    });
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass.replace(/\s/g, '') },
    });
    await transporter.verify();
    res.json({ ok: true, message: 'SMTP connected OK', user: smtpUser, host: smtpHost });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message, user: smtpUser, host: smtpHost });
  }
});

module.exports = router;
