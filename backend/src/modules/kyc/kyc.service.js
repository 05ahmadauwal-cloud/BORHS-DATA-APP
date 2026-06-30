const KYC = require('../../models/KYC');
const User = require('../../models/User');
const { KYC_STATUS, KYC_APPROVAL_STATUS } = require('../../config/constants');

const submitTier1 = async (userId) => {
  const user = await User.findById(userId);
  if (!user.isPhoneVerified) {
    throw Object.assign(new Error('Phone number must be verified for Tier 1 KYC'), { statusCode: 400 });
  }

  await KYC.findOneAndUpdate(
    { user: userId, tier: 1 },
    { user: userId, tier: 1, status: KYC_APPROVAL_STATUS.APPROVED, phoneVerified: true, phoneVerifiedAt: new Date() },
    { upsert: true, new: true }
  );

  await User.findByIdAndUpdate(userId, { kycStatus: KYC_STATUS.TIER1 });
  return { tier: 1, status: 'approved' };
};

const submitTier2 = async (userId, body, files) => {
  const { idType, idNumber, bvn } = body;
  const user = await User.findById(userId);

  if (user.kycStatus === KYC_STATUS.NONE) {
    throw Object.assign(new Error('Complete Tier 1 KYC first'), { statusCode: 400 });
  }

  const existing = await KYC.findOne({ user: userId, tier: 2, status: KYC_APPROVAL_STATUS.PENDING });
  if (existing) throw Object.assign(new Error('Tier 2 KYC already under review'), { statusCode: 400 });

  const idFrontImage = files?.idFront?.[0]?.path || null;
  const idBackImage = files?.idBack?.[0]?.path || null;

  await KYC.findOneAndUpdate(
    { user: userId, tier: 2 },
    {
      user: userId,
      tier: 2,
      status: KYC_APPROVAL_STATUS.PENDING,
      idType,
      idNumber,
      bvn,
      idFrontImage,
      idBackImage,
      submittedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return { tier: 2, status: 'pending' };
};

const submitTier3 = async (userId, files) => {
  const user = await User.findById(userId);
  if (user.kycStatus !== KYC_STATUS.TIER2) {
    throw Object.assign(new Error('Complete Tier 2 KYC approval first'), { statusCode: 400 });
  }

  const selfieImage = files?.selfie?.[0]?.path || null;

  await KYC.findOneAndUpdate(
    { user: userId, tier: 3 },
    { user: userId, tier: 3, status: KYC_APPROVAL_STATUS.PENDING, selfieImage, submittedAt: new Date() },
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
  }

  return kyc;
};

const getPendingKYC = async (query = {}) => {
  const { page = 1, limit = 20, tier } = query;
  const skip = (page - 1) * limit;
  const filter = { status: KYC_APPROVAL_STATUS.PENDING };
  if (tier) filter.tier = Number(tier);

  const [data, total] = await Promise.all([
    KYC.find(filter)
      .populate('user', 'firstName lastName email phone')
      .sort({ submittedAt: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    KYC.countDocuments(filter),
  ]);
  return { data, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

module.exports = { submitTier1, submitTier2, submitTier3, getKYCStatus, reviewKYC, getPendingKYC };
