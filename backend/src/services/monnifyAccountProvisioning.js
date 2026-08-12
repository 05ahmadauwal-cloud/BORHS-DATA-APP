const User = require('../models/User');
const logger = require('../utils/logger');

const hasMonnifyConfig = () => Boolean(
  process.env.MONNIFY_API_KEY
  && process.env.MONNIFY_SECRET_KEY
  && process.env.MONNIFY_CONTRACT_CODE
);

const ensureStarterAccount = async (userOrId) => {
  if (!hasMonnifyConfig()) return { skipped: true, reason: 'not_configured' };
  const user = typeof userOrId === 'object' && userOrId?._id
    ? userOrId
    : await User.findById(userOrId);
  if (!user) return { skipped: true, reason: 'user_not_found' };
  if (user.monnifyVirtualAccount?.reference && user.monnifyVirtualAccount?.accounts?.length) {
    return { skipped: true, reason: 'already_provisioned', account: user.monnifyVirtualAccount };
  }

  const { createReservedAccount } = require('./monnify');
  const account = await createReservedAccount(user);
  const virtualAccount = { ...account, kycSyncStatus: 'pending' };
  await User.findByIdAndUpdate(user._id, { monnifyVirtualAccount: virtualAccount });
  return { created: true, account: virtualAccount };
};

const backfillStarterAccounts = async () => {
  if (!hasMonnifyConfig()) {
    logger.warn('[MonnifyBackfill] Skipped because Monnify credentials are incomplete');
    return { eligible: 0, created: 0, failed: 0, skipped: true };
  }

  const users = await User.find({
    isActive: { $ne: false },
    $or: [
      { 'monnifyVirtualAccount.reference': { $exists: false } },
      { 'monnifyVirtualAccount.reference': null },
      { 'monnifyVirtualAccount.reference': '' },
      { 'monnifyVirtualAccount.accounts.0': { $exists: false } },
    ],
  }).select('_id firstName lastName email monnifyVirtualAccount');

  let created = 0;
  let failed = 0;
  for (const user of users) {
    try {
      const result = await ensureStarterAccount(user);
      if (result.created) created += 1;
    } catch (error) {
      failed += 1;
      logger.error(`[MonnifyBackfill] Failed for user ${user._id}: ${error.response?.data?.responseMessage || error.message}`);
    }
  }
  logger.info(`[MonnifyBackfill] Complete: eligible=${users.length}, created=${created}, failed=${failed}`);
  return { eligible: users.length, created, failed };
};

module.exports = { hasMonnifyConfig, ensureStarterAccount, backfillStarterAccounts };
