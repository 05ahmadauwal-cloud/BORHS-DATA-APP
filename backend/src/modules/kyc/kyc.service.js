const KYC = require('../../models/KYC');
const User = require('../../models/User');
const { KYC_STATUS, KYC_APPROVAL_STATUS } = require('../../config/constants');
const logger = require('../../utils/logger');

const getApprovedIdentity = async (userId) => {
  const record = await KYC.findOne({ user: userId, tier: 2, status: KYC_APPROVAL_STATUS.APPROVED }).lean();
  if (!record) return null;
  return { bvn: record.bvn || undefined, nin: record.idType === 'nin' ? record.idNumber : undefined };
};

const syncMonnifyKYC = async (userId) => {
  const [user, identity] = await Promise.all([User.findById(userId), getApprovedIdentity(userId)]);
  if (!user || (!identity?.bvn && !identity?.nin)) return { skipped: true };
  try {
    const { createReservedAccount, updateReservedAccountKYC } = require('../../services/monnify');
    let virtualAccount = user.monnifyVirtualAccount?.toObject?.() || user.monnifyVirtualAccount;
    if (virtualAccount?.reference) {
      try {
        await updateReservedAccountKYC(virtualAccount.reference, identity);
        virtualAccount.kycSyncStatus = 'synced';
        virtualAccount.kycSyncedAt = new Date();
        virtualAccount.kycSyncError = undefined;
      } catch (error) {
        const message = error.response?.data?.responseMessage || error.response?.data?.message || error.message;
        const accountMissing = /cannot find reserved account|reserved account.*not found/i.test(message);
        if (!accountMissing) throw error;

        // A reference created in Monnify sandbox is not present after switching
        // to live. Recreate the deterministic reference in the live environment.
        const created = await createReservedAccount(user, identity);
        virtualAccount = { ...created, kycSyncStatus: 'synced', kycSyncedAt: new Date() };
      }
    } else {
      const created = await createReservedAccount(user, identity);
      virtualAccount = { ...created, kycSyncStatus: 'synced', kycSyncedAt: new Date() };
    }
    await User.findByIdAndUpdate(userId, { monnifyVirtualAccount: virtualAccount });
    return { synced: true };
  } catch (error) {
    const message = error.response?.data?.responseMessage || error.response?.data?.message || error.message;
    logger.error(`Monnify KYC sync failed for user ${userId}: ${message}`);
    await User.findByIdAndUpdate(userId, {
      'monnifyVirtualAccount.kycSyncStatus': 'failed',
      'monnifyVirtualAccount.kycSyncError': message,
    });
    throw error;
  }
};

const submitTier1 = async (userId) => {
  // Auto-approve: user already supplied their name and phone at registration
  await KYC.findOneAndUpdate(
    { user: userId, tier: 1 },
    { user: userId, tier: 1, status: KYC_APPROVAL_STATUS.APPROVED, phoneVerified: true, phoneVerifiedAt: new Date(), submittedAt: new Date() },
    { upsert: true, new: true }
  );
  await User.findByIdAndUpdate(userId, { kycStatus: KYC_STATUS.TIER1 });
  return { tier: 1, status: 'approved' };
};

const submitNinForAccount = async (userId, nin) => {
  const normalizedNin = String(nin || '').replace(/\D/g, '');
  if (!/^\d{11}$/.test(normalizedNin)) {
    throw Object.assign(new Error('NIN must be exactly 11 digits'), { statusCode: 400 });
  }

  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  if (user.kycStatus === KYC_STATUS.NONE) await submitTier1(userId);

  await KYC.findOneAndUpdate(
    { user: userId, tier: 2 },
    {
      user: userId,
      tier: 2,
      status: KYC_APPROVAL_STATUS.APPROVED,
      idType: 'nin',
      idNumber: normalizedNin,
      submittedAt: new Date(),
      reviewedAt: new Date(),
      rejectionReason: null,
    },
    { upsert: true, new: true }
  );
  await User.findByIdAndUpdate(userId, { kycStatus: KYC_STATUS.TIER2 });

  try {
    await syncMonnifyKYC(userId);
    const updated = await User.findById(userId).select('kycStatus monnifyVirtualAccount');
    return { kycStatus: updated.kycStatus, virtualAccount: updated.monnifyVirtualAccount };
  } catch (error) {
    await KYC.findOneAndUpdate(
      { user: userId, tier: 2 },
      { status: KYC_APPROVAL_STATUS.PENDING, rejectionReason: error.message }
    );
    await User.findByIdAndUpdate(userId, { kycStatus: KYC_STATUS.TIER1 });
    throw error;
  }
};

const submitTier2 = async (userId, body, images = {}) => {
  const { idType, idNumber, bvn } = body;
  const user = await User.findById(userId);

  if (user.kycStatus === KYC_STATUS.NONE) {
    throw Object.assign(new Error('Complete Tier 1 KYC first'), { statusCode: 400 });
  }

  const existing = await KYC.findOne({ user: userId, tier: 2, status: KYC_APPROVAL_STATUS.PENDING });
  if (existing) throw Object.assign(new Error('Tier 2 KYC already under review'), { statusCode: 400 });

  // images contains base64 data URIs (Render-compatible — stored in MongoDB)
  await KYC.findOneAndUpdate(
    { user: userId, tier: 2 },
    {
      user: userId,
      tier: 2,
      status: KYC_APPROVAL_STATUS.PENDING,
      idType,
      idNumber,
      bvn,
      idFrontImage: images.idFront || null,
      idBackImage: images.idBack || null,
      submittedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return { tier: 2, status: 'pending' };
};

const submitTier3 = async (userId, images = {}) => {
  // The KYC record is authoritative. User.kycStatus can briefly be stale
  // after an admin review and must not block an already verified user.
  const verifiedTier2 = await KYC.exists({
    user: userId,
    tier: 2,
    status: KYC_APPROVAL_STATUS.APPROVED,
  });
  if (!verifiedTier2) {
    throw Object.assign(new Error('Complete Tier 2 verification first'), { statusCode: 400 });
  }
  if (!images.selfie) throw Object.assign(new Error('A selfie image is required'), { statusCode: 400 });

  await KYC.findOneAndUpdate(
    { user: userId, tier: 3 },
    {
      user: userId,
      tier: 3,
      status: KYC_APPROVAL_STATUS.PENDING,
      selfieImage: images.selfie,
      submittedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return { tier: 3, status: 'pending' };
};

const getKYCStatus = async (userId) => {
  const records = await KYC.find({ user: userId }).sort({ tier: 1 }).lean();
  const user = await User.findById(userId).select('kycStatus');
  return { overallStatus: user?.kycStatus, records };
};

const reviewKYC = async (adminId, kycId, action, rejectionReason) => {
  const kyc = await KYC.findById(kycId).populate('user');
  if (!kyc) throw Object.assign(new Error('KYC record not found'), { statusCode: 404 });

  kyc.status = action === 'approve' ? KYC_APPROVAL_STATUS.APPROVED : KYC_APPROVAL_STATUS.REJECTED;
  kyc.reviewedBy = adminId;
  kyc.reviewedAt = new Date();
  if (rejectionReason) kyc.rejectionReason = rejectionReason;
  await kyc.save();

  if (action === 'approve') {
    const tierMap = { 1: KYC_STATUS.TIER1, 2: KYC_STATUS.TIER2, 3: KYC_STATUS.TIER3 };
    await User.findByIdAndUpdate(kyc.user._id, { kycStatus: tierMap[kyc.tier] });
    if (kyc.tier === 2) await syncMonnifyKYC(kyc.user._id).catch(() => {});
  }

  return kyc;
};

const getPendingKYC = async (query = {}) => {
  return getKYCSubmissions({ ...query, status: 'pending' });
};

const getKYCSubmissions = async (query = {}) => {
  const { page = 1, limit = 20, tier, status = 'pending' } = query;
  const skip = (page - 1) * limit;
  const filter = {};
  if (status !== 'all') filter.status = status;
  if (tier) filter.tier = Number(tier);

  const [data, total] = await Promise.all([
    KYC.find(filter)
      .populate('user', 'firstName lastName email phone kycStatus')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-idFrontImage -idBackImage -selfieImage') // exclude heavy base64 from list
      .lean(),
    KYC.countDocuments(filter),
  ]);
  return { data, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

const getKYCById = async (kycId) => {
  const kyc = await KYC.findById(kycId)
    .populate('user', 'firstName lastName email phone kycStatus')
    .populate('reviewedBy', 'firstName lastName')
    .lean();
  if (!kyc) throw Object.assign(new Error('KYC record not found'), { statusCode: 404 });
  return kyc;
};

const getKYCCounts = async () => {
  const [pending, approved, rejected] = await Promise.all([
    KYC.countDocuments({ status: 'pending' }),
    KYC.countDocuments({ status: 'approved' }),
    KYC.countDocuments({ status: 'rejected' }),
  ]);
  return { pending, approved, rejected, all: pending + approved + rejected };
};

module.exports = { submitTier1, submitTier2, submitTier3, submitNinForAccount, getKYCStatus, reviewKYC, getPendingKYC, getKYCSubmissions, getKYCById, getKYCCounts, getApprovedIdentity, syncMonnifyKYC };
