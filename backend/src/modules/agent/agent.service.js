const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const Referral = require('../../models/Referral');
const AgentApplication = require('../../models/AgentApplication');
const { generateReference } = require('../../utils/helpers');
const { TRANSACTION_TYPES, TRANSACTION_STATUS, ROLES } = require('../../config/constants');
const Settings = require('../../models/Settings');
const logger = require('../../utils/logger');
const { debitWallet, fundWallet } = require('../wallet/wallet.service');

const COMMISSION_RATES = {
  [TRANSACTION_TYPES.DATA_PURCHASE]: { agent: 0.02, admin: 0.01 },
  [TRANSACTION_TYPES.AIRTIME_PURCHASE]: { agent: 0.01, admin: 0.005 },
  [TRANSACTION_TYPES.ELECTRICITY_PURCHASE]: { agent: 0.015, admin: 0.01 },
  [TRANSACTION_TYPES.CABLE_PURCHASE]: { agent: 0.015, admin: 0.01 },
  [TRANSACTION_TYPES.EDUCATION_PURCHASE]: { agent: 0.02, admin: 0.01 },
};

const processCommission = async (userId, amount, transactionType, transactionId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const rates = COMMISSION_RATES[transactionType];
  if (!rates) return;

  // If user is agent, they earn from their own transactions
  if (user.role === ROLES.AGENT) {
    const agentCommission = amount * rates.agent;
    if (agentCommission > 0) {
      await User.findByIdAndUpdate(userId, { $inc: { walletBalance: agentCommission, commissionEarned: agentCommission } });
      await Transaction.create({
        user: userId,
        type: TRANSACTION_TYPES.COMMISSION_EARNED,
        amount: agentCommission,
        balanceBefore: user.walletBalance,
        balanceAfter: user.walletBalance + agentCommission,
        status: TRANSACTION_STATUS.SUCCESS,
        reference: generateReference('COM'),
        gateway: 'system',
        description: `Commission on ${transactionType.replace(/_/g, ' ')}`,
        metadata: { sourceTransaction: transactionId, rate: rates.agent },
        completedAt: new Date(),
      });
    }
  }

  // Process referral commissions up the chain
  const referrals = await Referral.find({ referred: userId }).populate('referrer');
  for (const ref of referrals) {
    const referrer = ref.referrer;
    if (!referrer || !referrer.isActive) continue;

    const referralRates = await getReferralRates();
    const rate = referralRates[`level${ref.level}`] / 100;
    const commission = amount * rate;

    if (commission > 0) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { walletBalance: commission, referralEarnings: commission },
      });

      await Transaction.create({
        user: referrer._id,
        type: TRANSACTION_TYPES.REFERRAL_BONUS,
        amount: commission,
        balanceBefore: referrer.walletBalance,
        balanceAfter: referrer.walletBalance + commission,
        status: TRANSACTION_STATUS.SUCCESS,
        reference: generateReference('REF'),
        gateway: 'system',
        description: `Level ${ref.level} referral commission`,
        metadata: { referredUserId: userId, sourceTransaction: transactionId, level: ref.level },
        completedAt: new Date(),
      });

      await Referral.findByIdAndUpdate(ref._id, {
        $inc: { totalEarnings: commission },
        $push: {
          commissions: {
            transaction: transactionId,
            transactionAmount: amount,
            commissionRate: rate,
            commissionAmount: commission,
            type: transactionType,
          },
        },
      });
    }
  }
};

const getReferralRates = async () => {
  return {
    level1: parseFloat(process.env.REFERRAL_LEVEL1_PERCENT) || 5,
    level2: parseFloat(process.env.REFERRAL_LEVEL2_PERCENT) || 2,
    level3: parseFloat(process.env.REFERRAL_LEVEL3_PERCENT) || 1,
  };
};

const getAgentStats = async (agentId) => {
  const [user, downlines, commissions] = await Promise.all([
    User.findById(agentId).select('walletBalance referralEarnings commissionEarned'),
    User.countDocuments({ referredBy: agentId }),
    Transaction.aggregate([
      { $match: { user: agentId, type: TRANSACTION_TYPES.COMMISSION_EARNED } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
  ]);

  return {
    walletBalance: user?.walletBalance || 0,
    referralEarnings: user?.referralEarnings || 0,
    commissionEarned: commissions[0]?.total || 0,
    totalCommissions: commissions[0]?.count || 0,
    downlineCount: downlines,
  };
};

const getAgentDownlines = async (agentId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const [downlines, total] = await Promise.all([
    User.find({ referredBy: agentId })
      .select('firstName lastName email phone role createdAt walletBalance')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments({ referredBy: agentId }),
  ]);
  return { data: downlines, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

const getCommissionHistory = async (agentId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const filter = { user: agentId, type: { $in: [TRANSACTION_TYPES.COMMISSION_EARNED, TRANSACTION_TYPES.REFERRAL_BONUS] } };
  const [data, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Transaction.countDocuments(filter),
  ]);
  return { data, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

// ─── Agent Application ────────────────────────────────────────────────────────

const DEFAULT_AGENT_FEE = 5000;

const getAgentFee = async () => {
  const fee = await Settings.get('agent_fee', DEFAULT_AGENT_FEE);
  return Number(fee);
};

const applyForAgent = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  if (user.role === ROLES.AGENT) {
    throw Object.assign(new Error('You are already an agent'), { statusCode: 400 });
  }

  const existing = await AgentApplication.findOne({ user: userId });
  if (existing) {
    if (existing.status === 'pending') {
      throw Object.assign(new Error('You already have a pending application'), { statusCode: 400 });
    }
    if (existing.status === 'approved') {
      throw Object.assign(new Error('Your application was already approved'), { statusCode: 400 });
    }
    // rejected — allow reapplication
  }

  const fee = await getAgentFee();
  if (user.walletBalance < fee) {
    throw Object.assign(
      new Error(`Insufficient balance. You need ₦${fee.toLocaleString()} to apply. Please fund your wallet.`),
      { statusCode: 400 }
    );
  }

  // Deduct fee from wallet
  const { reference } = await debitWallet(
    userId,
    fee,
    TRANSACTION_TYPES.AGENT_FEE,
    'Agent registration fee',
    { purpose: 'agent_application' }
  );

  // Create or update application
  const application = await AgentApplication.findOneAndUpdate(
    { user: userId },
    { status: 'pending', amountPaid: fee, transactionRef: reference, submittedAt: new Date(), rejectionReason: undefined, reviewedBy: undefined, reviewedAt: undefined },
    { upsert: true, new: true }
  );

  return { application, fee, reference };
};

const getMyApplication = async (userId) => {
  const application = await AgentApplication.findOne({ user: userId })
    .populate('reviewedBy', 'firstName lastName')
    .lean();
  const fee = await getAgentFee();
  return { application, fee };
};

// ─── Admin: Agent Applications ────────────────────────────────────────────────

const getAgentApplications = async (query = {}) => {
  const { page = 1, limit = 20, status } = query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;

  const [data, total] = await Promise.all([
    AgentApplication.find(filter)
      .populate('user', 'firstName lastName email phone walletBalance role')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    AgentApplication.countDocuments(filter),
  ]);

  return { data, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

const getAgentApplicationCounts = async () => {
  const [pending, approved, rejected] = await Promise.all([
    AgentApplication.countDocuments({ status: 'pending' }),
    AgentApplication.countDocuments({ status: 'approved' }),
    AgentApplication.countDocuments({ status: 'rejected' }),
  ]);
  return { pending, approved, rejected };
};

const reviewAgentApplication = async (adminId, appId, action, rejectionReason) => {
  const application = await AgentApplication.findById(appId).populate('user');
  if (!application) throw Object.assign(new Error('Application not found'), { statusCode: 404 });
  if (application.status !== 'pending') {
    throw Object.assign(new Error('Application has already been reviewed'), { statusCode: 400 });
  }

  application.status = action === 'approve' ? 'approved' : 'rejected';
  application.reviewedBy = adminId;
  application.reviewedAt = new Date();
  if (rejectionReason) application.rejectionReason = rejectionReason;
  await application.save();

  if (action === 'approve') {
    await User.findByIdAndUpdate(application.user._id, { role: ROLES.AGENT });
  } else {
    // Refund the fee on rejection
    await fundWallet(
      application.user._id,
      application.amountPaid,
      'system',
      `REFUND-${application.transactionRef}`,
      { reason: 'Agent application rejected — fee refunded', applicationId: appId }
    );
  }

  return application;
};

module.exports = {
  processCommission, getReferralRates, getAgentStats, getAgentDownlines, getCommissionHistory,
  getAgentFee, applyForAgent, getMyApplication,
  getAgentApplications, getAgentApplicationCounts, reviewAgentApplication,
};
