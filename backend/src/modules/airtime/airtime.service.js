const AirtimePurchase = require('../../models/AirtimePurchase');
const User = require('../../models/User');
const { debitWallet } = require('../wallet/wallet.service');
const { withFallback } = require('../../services/providers');
const { generateReference, sanitizePhone } = require('../../utils/helpers');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../../config/constants');
const { processCommission } = require('../agent/agent.service');
const logger = require('../../utils/logger');

const purchaseAirtime = async (userId, body) => {
  const { network, phone } = body;
  const amount = Number(body.amount);
  const targetPhone = sanitizePhone(phone);

  if (amount < 100) throw Object.assign(new Error('Minimum airtime amount is ₦100'), { statusCode: 400 });
  if (amount > 50000) throw Object.assign(new Error('Maximum airtime amount is ₦50,000'), { statusCode: 400 });

  const user = await User.findById(userId).select('+transactionPin');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  // Require and validate transaction PIN
  const { pin } = body;
  if (!user.isPinSet) throw Object.assign(new Error('Transaction PIN not set. Please set a PIN to continue.'), { statusCode: 400 });
  if (!pin || !/^\d{4}$/.test(String(pin))) throw Object.assign(new Error('Transaction PIN must be a 4-digit code'), { statusCode: 400 });
  const pinOk = await user.comparePin(String(pin));
  if (!pinOk) throw Object.assign(new Error('Invalid transaction PIN'), { statusCode: 401 });
  const discountRate = user.role === 'agent' ? 0.03 : 0;
  const price = Math.ceil(amount * (1 - discountRate));

  if (user.walletBalance < price) {
    throw Object.assign(
      new Error(`Insufficient funds. Required: ₦${price.toLocaleString()}, Available: ₦${user.walletBalance.toLocaleString()}`),
      { statusCode: 400 }
    );
  }

  const reference = generateReference('AIR');

  const purchase = await AirtimePurchase.create({
    user: userId,
    network,
    phone: targetPhone,
    amount: price,
    amountSent: amount,
    discount: amount - price,
    reference,
    status: TRANSACTION_STATUS.PENDING,
  });

  // Debit wallet
  let debitResult;
  try {
    debitResult = await debitWallet(
      userId, price, TRANSACTION_TYPES.AIRTIME_PURCHASE,
      `₦${amount} ${network.toUpperCase()} airtime for ${targetPhone}`,
      { network, phone: targetPhone }
    );
    purchase.transaction = debitResult.transaction._id;
    await purchase.save();
  } catch (error) {
    purchase.status = TRANSACTION_STATUS.FAILED;
    purchase.failureReason = error.message;
    await purchase.save();
    throw error;
  }

  // Call provider
  try {
    const providerResult = await withFallback('purchaseAirtime', {
      network,
      phone: targetPhone,
      amount,
      reference,
    });

    purchase.status = TRANSACTION_STATUS.SUCCESS;
    purchase.provider = providerResult.provider;
    purchase.providerReference = providerResult.providerReference;
    purchase.providerResponse = providerResult.response;
    purchase.completedAt = new Date();
    await purchase.save();

    processCommission(userId, price, TRANSACTION_TYPES.AIRTIME_PURCHASE, debitResult.transaction._id)
      .catch((e) => logger.error('Commission error:', e));

    return purchase;
  } catch (error) {
    logger.error(`[AirtimePurchase] Provider failed: ${error.message}`);
    purchase.status = TRANSACTION_STATUS.FAILED;
    purchase.failureReason = error.message;
    await purchase.save();

    // Refund wallet
    await User.findByIdAndUpdate(userId, { $inc: { walletBalance: price } });

    throw Object.assign(
      new Error(`Airtime purchase failed: ${error.message}. Your wallet has been refunded.`),
      { statusCode: 502 }
    );
  }
};

const purchaseBulkAirtime = async (userId, recipients) => {
  const results = [];
  for (const r of recipients) {
    try {
      const result = await purchaseAirtime(userId, r);
      results.push({ phone: r.phone, status: 'success', reference: result.reference });
    } catch (e) {
      results.push({ phone: r.phone, status: 'failed', error: e.message });
    }
  }
  return results;
};

const getAirtimeHistory = async (userId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    AirtimePurchase.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    AirtimePurchase.countDocuments({ user: userId }),
  ]);
  return { data, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

module.exports = { purchaseAirtime, purchaseBulkAirtime, getAirtimeHistory };
