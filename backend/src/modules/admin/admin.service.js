const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const DataPlan = require('../../models/DataPlan');
const Settings = require('../../models/Settings');
const AuditLog = require('../../models/AuditLog');
const { generateReference } = require('../../utils/helpers');
const { TRANSACTION_TYPES, TRANSACTION_STATUS, ROLES } = require('../../config/constants');
const mongoose = require('mongoose');

// ─── User Management ──────────────────────────────────────────────────────────
const getUsers = async (query = {}) => {
  const { page = 1, limit = 20, role, search, isActive, kycStatus } = query;
  const skip = (page - 1) * limit;
  const filter = {};
  if (role) filter.role = role;
  if (isActive === 'true') filter.isActive = true;
  if (isActive === 'false') filter.isActive = false;
  if (kycStatus) filter.kycStatus = kycStatus;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(filter),
  ]);
  return { data: users, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password').lean();
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};

const updateUser = async (userId, updates) => {
  const allowed = ['firstName', 'lastName', 'phone', 'role', 'commissionRate', 'agentLevel'];
  const filtered = {};
  allowed.forEach((k) => { if (updates[k] !== undefined) filtered[k] = updates[k]; });
  return User.findByIdAndUpdate(userId, filtered, { new: true, runValidators: true }).select('-password');
};

const suspendUser = async (userId, reason, adminId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false, suspendedAt: new Date(), suspendedReason: reason },
    { new: true }
  ).select('-password');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};

const activateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: true, $unset: { suspendedAt: 1, suspendedReason: 1 } },
    { new: true }
  ).select('-password');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};

const adjustWallet = async (adminId, userId, amount, type, reason) => {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const isCredit = type === 'credit';
  if (!isCredit && user.walletBalance < Math.abs(amount)) {
    throw Object.assign(new Error('User has insufficient balance for this debit'), { statusCode: 400 });
  }

  const balanceBefore = user.walletBalance;
  const balanceAfter = isCredit ? balanceBefore + amount : balanceBefore - amount;

  await User.findByIdAndUpdate(userId, { walletBalance: balanceAfter });

  await Transaction.create({
    user: userId,
    type: isCredit ? TRANSACTION_TYPES.WALLET_FUND : TRANSACTION_TYPES.WITHDRAWAL,
    amount: Math.abs(amount),
    balanceBefore,
    balanceAfter,
    status: TRANSACTION_STATUS.SUCCESS,
    reference: generateReference('ADJ'),
    gateway: 'system',
    description: `Admin ${type}: ${reason}`,
    metadata: { adminId, reason },
    completedAt: new Date(),
  });

  return { newBalance: balanceAfter };
};

// ─── Transaction Management ───────────────────────────────────────────────────
const getTransactions = async (query = {}) => {
  const { page = 1, limit = 20, type, status, startDate, endDate, userId } = query;
  const skip = (page - 1) * limit;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (userId) filter.user = userId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  const [data, total] = await Promise.all([
    Transaction.find(filter).populate('user', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Transaction.countDocuments(filter),
  ]);
  return { data, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

const reverseTransaction = async (adminId, transactionId, reason) => {
  const txn = await Transaction.findById(transactionId).populate('user');
  if (!txn) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });
  if (txn.status === TRANSACTION_STATUS.REVERSED) {
    throw Object.assign(new Error('Transaction already reversed'), { statusCode: 400 });
  }
  await User.findByIdAndUpdate(txn.user._id, { $inc: { walletBalance: txn.amount } });
  await Transaction.findByIdAndUpdate(transactionId, {
    status: TRANSACTION_STATUS.REVERSED,
    reversedAt: new Date(),
    reversedBy: adminId,
    failureReason: reason,
  });
  return { success: true };
};

// ─── Analytics ────────────────────────────────────────────────────────────────
const getAnalytics = async (period = '30d') => {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalRevenue, totalUsers, totalTransactions, revenueByType, dailyRevenue, userGrowth] = await Promise.all([
    Transaction.aggregate([
      { $match: { status: 'success', createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    User.countDocuments({ createdAt: { $gte: startDate } }),
    Transaction.countDocuments({ createdAt: { $gte: startDate }, status: 'success' }),
    Transaction.aggregate([
      { $match: { status: 'success', createdAt: { $gte: startDate } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Transaction.aggregate([
      { $match: { status: 'success', createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    summary: {
      revenue: totalRevenue[0]?.total || 0,
      users: totalUsers,
      transactions: totalTransactions,
    },
    revenueByType,
    dailyRevenue,
    userGrowth,
  };
};

// ─── Data Plan Management ─────────────────────────────────────────────────────
const getDataPlans = async (query = {}) => {
  const { network, dataType, isActive } = query;
  const filter = {};
  if (network) filter.network = network;
  if (dataType) filter.dataType = dataType;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  return DataPlan.find(filter).sort({ network: 1, sellingPrice: 1 }).lean();
};

const createDataPlan = async (data) => DataPlan.create(data);

const updateDataPlan = async (id, updates) => {
  return DataPlan.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
};

const deleteDataPlan = async (id) => DataPlan.findByIdAndDelete(id);

// ─── Settings ─────────────────────────────────────────────────────────────────
const getSettings = async () => {
  const settings = await Settings.find({}).lean();
  const result = {};
  settings.forEach((s) => (result[s.key] = s.value));
  return result;
};

const updateSettings = async (userId, settingsObj) => {
  const ops = Object.entries(settingsObj).map(([key, value]) => Settings.set(key, value, userId));
  await Promise.all(ops);
  return getSettings();
};

module.exports = {
  getUsers, getUserById, updateUser, suspendUser, activateUser, adjustWallet,
  getTransactions, reverseTransaction,
  getAnalytics,
  getDataPlans, createDataPlan, updateDataPlan, deleteDataPlan,
  getSettings, updateSettings,
};
