const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const Referral = require('../../models/Referral');
const { generateReference } = require('../../utils/helpers');
const { TRANSACTION_TYPES, TRANSACTION_STATUS, ROLES } = require('../../config/constants');
const Settings = require('../../models/Settings');
const logger = require('../../utils/logger');

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

module.exports = { processCommission, getReferralRates, getAgentStats, getAgentDownlines, getCommissionHistory };
