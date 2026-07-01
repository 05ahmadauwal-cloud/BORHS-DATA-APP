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
    const transporter = nodemailer.createTransporter({
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
