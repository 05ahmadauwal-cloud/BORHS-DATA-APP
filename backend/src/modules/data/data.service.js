const DataPurchase = require('../../models/DataPurchase');
const DataPlan = require('../../models/DataPlan');
const User = require('../../models/User');
const { debitWallet } = require('../wallet/wallet.service');
const { withFallback } = require('../../services/providers');
const { generateReference, sanitizePhone } = require('../../utils/helpers');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../../config/constants');
const { processCommission } = require('../agent/agent.service');
const logger = require('../../utils/logger');

const getDataPlans = async (network, dataType) => {
  const filter = { isActive: true };
  if (network) filter.network = network;
  if (dataType) filter.dataType = dataType;
  return DataPlan.find(filter).sort({ network: 1, sellingPrice: 1 }).lean();
};

const purchaseData = async (userId, body) => {
  const { network, planId, phone, dataType, recipientPhone, pin } = body;
  const targetPhone = sanitizePhone(recipientPhone || phone);

  const plan = await DataPlan.findOne({ planId, network, isActive: true });
  if (!plan) throw Object.assign(new Error('Data plan not found or unavailable'), { statusCode: 404 });

  const user = await User.findById(userId).select('+transactionPin');
  const price = user.role === 'agent' ? (plan.agentPrice || plan.sellingPrice) : plan.sellingPrice;

  if (user.walletBalance < price) {
    throw Object.assign(new Error('Insufficient wallet balance'), { statusCode: 400 });
  }

  const reference = generateReference('DATA');

  const purchase = await DataPurchase.create({
    user: userId,
    network,
    dataType: dataType || plan.dataType,
    planId,
    planName: plan.name,
    dataSize: plan.dataSize,
    validity: plan.validity,
    phone: targetPhone,
    amount: price,
    reference,
    status: TRANSACTION_STATUS.PENDING,
  });

  try {
    const { debitResult, txn } = await debitAndRecord(userId, price, reference, plan, targetPhone);
    purchase.transaction = txn._id;

    const providerResult = await withFallback('purchaseData', {
      network,
      planCode: plan.providerPlanCode || planId,
      phone: targetPhone,
      reference,
    });

    purchase.status = TRANSACTION_STATUS.SUCCESS;
    purchase.provider = providerResult.provider;
    purchase.providerReference = providerResult.providerReference;
    purchase.providerResponse = providerResult.response;
    purchase.completedAt = new Date();
    await purchase.save();

    await processCommission(userId, price, TRANSACTION_TYPES.DATA_PURCHASE, txn._id).catch((e) =>
      logger.error('Commission error:', e)
    );

    return purchase;
  } catch (error) {
    purchase.status = TRANSACTION_STATUS.FAILED;
    purchase.failureReason = error.message;
    await purchase.save();

    // Refund
    const User2 = require('../../models/User');
    await User2.findByIdAndUpdate(userId, { $inc: { walletBalance: price } });

    throw Object.assign(new Error(`Data purchase failed: ${error.message}`), { statusCode: 502 });
  }
};

const debitAndRecord = async (userId, price, reference, plan, phone) => {
  const debitResult = await debitWallet(
    userId, price, TRANSACTION_TYPES.DATA_PURCHASE,
    `${plan.dataSize} ${plan.name} data for ${phone}`,
    { planId: plan.planId, network: plan.network, phone }
  );
  return { debitResult, txn: debitResult.transaction };
};

const getDataHistory = async (userId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    DataPurchase.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    DataPurchase.countDocuments({ user: userId }),
  ]);
  return { data, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

module.exports = { getDataPlans, purchaseData, getDataHistory };
