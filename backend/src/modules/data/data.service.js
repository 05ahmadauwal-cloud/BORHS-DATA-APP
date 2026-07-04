const DataPurchase = require('../../models/DataPurchase');
const DataPlan = require('../../models/DataPlan');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
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
  const { network, planId, phone, dataType, recipientPhone } = body;
  const targetPhone = sanitizePhone(recipientPhone || phone);

  // 1. Load plan
  const plan = await DataPlan.findOne({ planId, network, isActive: true });
  if (!plan) throw Object.assign(new Error('Data plan not found or unavailable'), { statusCode: 404 });

  // 2. Determine price based on role
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const price = user.role === 'agent'
    ? (plan.agentPrice || plan.sellingPrice)
    : plan.sellingPrice;

  if (user.walletBalance < price) {
    throw Object.assign(
      new Error(`Insufficient balance. Required: ₦${price.toLocaleString()}, Available: ₦${user.walletBalance.toLocaleString()}`),
      { statusCode: 400 }
    );
  }

  const reference = generateReference('DATA');

  // 3. Create purchase record
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

  // 4. Debit wallet
  let debitResult;
  try {
    debitResult = await debitWallet(
      userId, price, TRANSACTION_TYPES.DATA_PURCHASE,
      `${plan.dataSize} ${plan.name} for ${targetPhone}`,
      { planId: plan.planId, network: plan.network, phone: targetPhone }
    );
    purchase.transaction = debitResult.transaction._id;
    await purchase.save();
  } catch (error) {
    purchase.status = TRANSACTION_STATUS.FAILED;
    purchase.failureReason = error.message;
    await purchase.save();
    throw error; // Already has statusCode from debitWallet
  }

  // 5. Call VTU provider
  const providerPlanCode = plan.providerPlanCode || planId;
  logger.info(`[DataPurchase] Provider call: network=${network} planCode=${providerPlanCode} phone=${targetPhone}`);

  try {
    const providerResult = await withFallback('purchaseData', {
      network,
      planCode: providerPlanCode,
      phone: targetPhone,
      reference,
    });

    purchase.status = TRANSACTION_STATUS.SUCCESS;
    purchase.provider = providerResult.provider;
    purchase.providerReference = providerResult.providerReference;
    purchase.providerResponse = providerResult.response;
    purchase.completedAt = new Date();
    await purchase.save();

    // 6. Process agent/referral commission
    processCommission(userId, price, TRANSACTION_TYPES.DATA_PURCHASE, debitResult.transaction._id)
      .catch((e) => logger.error('Commission error:', e));

    return purchase;

  } catch (error) {
    logger.error(`[DataPurchase] Provider failed: ${error.message}`);

    // Mark purchase as failed
    purchase.status = TRANSACTION_STATUS.FAILED;
    purchase.failureReason = error.message;
    await purchase.save();

    // Refund wallet
    await User.findByIdAndUpdate(userId, { $inc: { walletBalance: price } });

    // Update debit transaction to reversed
    await Transaction.findByIdAndUpdate(debitResult.transaction._id, {
      status: TRANSACTION_STATUS.REVERSED,
      reversedAt: new Date(),
      failureReason: `Provider failed: ${error.message}`,
    });

    throw Object.assign(
      new Error(`Data purchase failed: ${error.message}. Your wallet has been refunded.`),
      { statusCode: 502 }
    );
  }
};

const getDataHistory = async (userId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    DataPurchase.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    DataPurchase.countDocuments({ user: userId }),
  ]);
  return {
    data,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  };
};

module.exports = { getDataPlans, purchaseData, getDataHistory };
