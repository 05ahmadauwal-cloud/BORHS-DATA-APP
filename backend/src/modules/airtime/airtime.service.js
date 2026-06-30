const AirtimePurchase = require('../../models/AirtimePurchase');
const User = require('../../models/User');
const { debitWallet } = require('../wallet/wallet.service');
const { withFallback } = require('../../services/providers');
const { generateReference, sanitizePhone } = require('../../utils/helpers');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../../config/constants');
const { processCommission } = require('../agent/agent.service');
const logger = require('../../utils/logger');

const purchaseAirtime = async (userId, body) => {
  const { network, phone, amount } = body;
  const targetPhone = sanitizePhone(phone);

  if (amount < 50) throw Object.assign(new Error('Minimum airtime amount is ₦50'), { statusCode: 400 });
  if (amount > 50000) throw Object.assign(new Error('Maximum airtime amount is ₦50,000'), { statusCode: 400 });

  const user = await User.findById(userId);
  const discountRate = user.role === 'agent' ? 0.03 : 0;
  const price = amount * (1 - discountRate);

  if (user.walletBalance < price) {
    throw Object.assign(new Error('Insufficient wallet balance'), { statusCode: 400 });
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

  try {
    const debitResult = await debitWallet(
      userId, price, TRANSACTION_TYPES.AIRTIME_PURCHASE,
      `₦${amount} ${network.toUpperCase()} airtime for ${targetPhone}`,
      { network, phone: targetPhone }
    );
    purchase.transaction = debitResult.transaction._id;

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

    await processCommission(userId, price, TRANSACTION_TYPES.AIRTIME_PURCHASE, debitResult.transaction._id)
      .catch((e) => logger.error('Commission error:', e));

    return purchase;
  } catch (error) {
    purchase.status = TRANSACTION_STATUS.FAILED;
    purchase.failureReason = error.message;
    await purchase.save();
    await User.findByIdAndUpdate(userId, { $inc: { walletBalance: price } });
    throw Object.assign(new Error(`Airtime purchase failed: ${error.message}`), { statusCode: 502 });
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
