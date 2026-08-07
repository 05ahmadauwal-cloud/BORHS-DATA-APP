const DataPurchase = require('../../models/DataPurchase');
const DataPlan = require('../../models/DataPlan');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { debitWallet, refundWalletDebit } = require('../wallet/wallet.service');
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

const purchaseData = async (userId, body, options = {}) => {
  const { network, planId, phone, dataType, recipientPhone } = body;
  const targetPhone = sanitizePhone(recipientPhone || phone);

  // 1. Load plan
  const plan = await DataPlan.findOne({ planId, network, isActive: true });
  if (!plan) throw Object.assign(new Error('Data plan not found or unavailable'), { statusCode: 404 });

  // 2. Determine price based on role
  const user = await User.findById(userId).select('+transactionPin');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  // Require and validate transaction PIN
  const { pin } = body;
  if (!options.skipPin) {
    if (!user.isPinSet) throw Object.assign(new Error('Transaction PIN not set. Please set a PIN to continue.'), { statusCode: 400 });
    if (!pin || !/^\d{4}$/.test(String(pin))) throw Object.assign(new Error('Transaction PIN must be a 4-digit code'), { statusCode: 400 });
    const pinOk = await user.comparePin(String(pin));
    if (!pinOk) throw Object.assign(new Error('Invalid transaction PIN'), { statusCode: 401 });
  }

  const price = user.role === 'agent'
    ? (plan.agentPrice || plan.sellingPrice)
    : plan.sellingPrice;

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
      { planId: plan.planId, network: plan.network, phone: targetPhone }, null, body.paymentSource
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

    // Keep the customer-facing provider details with the wallet transaction so
    // receipts opened from transaction history contain the same useful facts as
    // the receipt shown immediately after purchase. Do not copy the entire raw
    // provider payload into the wallet ledger.
    const response = providerResult.response || {};
    const responseData = response.data && typeof response.data === 'object' ? response.data : {};
    const providerStatus = response.Status || response.status || responseData.Status || responseData.status || 'successful';
    const providerMessage = response.message || response.Message || response.api_response
      || responseData.message || responseData.api_response || '';
    await Transaction.findByIdAndUpdate(debitResult.transaction._id, {
      serviceData: {
        purchaseReference: reference,
        provider: providerResult.provider,
        providerReference: providerResult.providerReference,
        providerStatus: String(providerStatus),
        providerMessage: String(providerMessage),
        network: plan.network,
        phone: targetPhone,
        planName: plan.name,
        dataSize: plan.dataSize,
        validity: plan.validity,
        dataType: dataType || plan.dataType,
      },
    });

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
    await refundWalletDebit(userId, debitResult);

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

const purchaseBulkData = async (userId, recipients, pin, paymentSource) => {
  const results = [];
  for (const recipient of recipients) {
    try {
      const purchase = await purchaseData(userId, { ...recipient, pin, paymentSource });
      results.push({ phone: recipient.phone, status: 'success', reference: purchase.reference });
    } catch (error) {
      results.push({ phone: recipient.phone, status: 'failed', error: error.message });
    }
  }
  return results;
};

module.exports = { getDataPlans, purchaseData, purchaseBulkData, getDataHistory };
