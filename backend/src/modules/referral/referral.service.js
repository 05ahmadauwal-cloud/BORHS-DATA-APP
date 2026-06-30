const Referral = require('../../models/Referral');
const User = require('../../models/User');

const processReferral = async (newUserId, referrerId) => {
  // Level 1: direct referrer
  await Referral.create({ referrer: referrerId, referred: newUserId, level: 1 });

  // Level 2: referrer's referrer
  const level1Referrer = await User.findById(referrerId).select('referredBy');
  if (level1Referrer?.referredBy) {
    await Referral.create({ referrer: level1Referrer.referredBy, referred: newUserId, level: 2 });

    // Level 3: referrer's referrer's referrer
    const level2Referrer = await User.findById(level1Referrer.referredBy).select('referredBy');
    if (level2Referrer?.referredBy) {
      await Referral.create({ referrer: level2Referrer.referredBy, referred: newUserId, level: 3 });
    }
  }
};

const getReferralTree = async (userId) => {
  const directReferrals = await Referral.find({ referrer: userId, level: 1 })
    .populate('referred', 'firstName lastName email createdAt')
    .lean();

  const level2 = await Referral.find({ referrer: userId, level: 2 })
    .populate('referred', 'firstName lastName email createdAt')
    .lean();

  const level3 = await Referral.find({ referrer: userId, level: 3 })
    .populate('referred', 'firstName lastName email createdAt')
    .lean();

  const user = await User.findById(userId).select('referralEarnings referralCode');

  return {
    referralCode: user?.referralCode,
    referralLink: `${process.env.CLIENT_URL}/register?ref=${user?.referralCode}`,
    totalEarnings: user?.referralEarnings || 0,
    level1: { count: directReferrals.length, users: directReferrals.map((r) => r.referred) },
    level2: { count: level2.length, users: level2.map((r) => r.referred) },
    level3: { count: level3.length, users: level3.map((r) => r.referred) },
  };
};

const getReferralStats = async (userId) => {
  const [l1, l2, l3, earnings] = await Promise.all([
    Referral.countDocuments({ referrer: userId, level: 1 }),
    Referral.countDocuments({ referrer: userId, level: 2 }),
    Referral.countDocuments({ referrer: userId, level: 3 }),
    Referral.aggregate([
      { $match: { referrer: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) } },
      { $group: { _id: null, total: { $sum: '$totalEarnings' } } },
    ]),
  ]);
  const user = await User.findById(userId).select('referralCode referralEarnings');
  return {
    referralCode: user?.referralCode,
    referralLink: `${process.env.CLIENT_URL}/register?ref=${user?.referralCode}`,
    totalEarnings: user?.referralEarnings || 0,
    counts: { level1: l1, level2: l2, level3: l3, total: l1 + l2 + l3 },
  };
};

module.exports = { processReferral, getReferralTree, getReferralStats };
