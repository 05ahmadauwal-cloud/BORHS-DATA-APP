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

// Test VTpass credentials (admin only, development only)
if (process.env.NODE_ENV !== 'production') {
  router.get('/test/vtpass-balance', async (req, res) => {
    try {
      const vtpass = require('../services/providers/vtpass');
      const balance = await vtpass.checkBalance();
      res.json({ success: true, balance });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  });
}

module.exports = router;
