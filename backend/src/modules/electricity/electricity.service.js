const ElectricityPurchase = require('../../models/ElectricityPurchase');
const User = require('../../models/User');
const { debitWallet } = require('../wallet/wallet.service');
const { withFallback, getProvider } = require('../../services/providers');
const { generateReference } = require('../../utils/helpers');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../../config/constants');
const { processCommission } = require('../agent/agent.service');
const logger = require('../../utils/logger');

const verifyMeter = async (provider, meterNumber, meterType) => {
  const p = getProvider();
  return p.verifyMeter({ provider, meterNumber, meterType });
};

const purchaseElectricity = async (userId, body) => {
  const { provider, meterNumber, meterType, amount, phone } = body;

  if (amount < 500) throw Object.assign(new Error('Minimum electricity purchase is ₦500'), { statusCode: 400 });

  const user = await User.findById(userId).select('+transactionPin');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  // Require and validate transaction PIN
  const { pin } = body;
  if (!user.isPinSet) throw Object.assign(new Error('Transaction PIN not set. Please set a PIN to continue.'), { statusCode: 400 });
  if (!pin || !/^\d{4}$/.test(String(pin))) throw Object.assign(new Error('Transaction PIN must be a 4-digit code'), { statusCode: 400 });
  const pinOk = await user.comparePin(String(pin));
  if (!pinOk) throw Object.assign(new Error('Invalid transaction PIN'), { statusCode: 401 });

  if (user.walletBalance < amount) {
    throw Object.assign(new Error('Insufficient wallet balance'), { statusCode: 400 });
  }

  let customerInfo = {};
  try {
    customerInfo = await verifyMeter(provider, meterNumber, meterType);
  } catch (e) {
    throw Object.assign(new Error('Meter verification failed. Check meter number.'), { statusCode: 400 });
  }

  const reference = generateReference('ELEC');

  const purchase = await ElectricityPurchase.create({
    user: userId,
    provider,
    meterNumber,
    meterType,
    customerName: customerInfo.customerName,
    customerAddress: customerInfo.customerAddress,
    amount,
    reference,
    status: TRANSACTION_STATUS.PENDING,
  });

  try {
    const debitResult = await debitWallet(
      userId, amount, TRANSACTION_TYPES.ELECTRICITY_PURCHASE,
      `₦${amount} electricity for meter ${meterNumber}`,
      { provider, meterNumber, meterType }
    );
    purchase.transaction = debitResult.transaction._id;

    const providerResult = await withFallback('purchaseElectricity', {
      provider, meterNumber, meterType, amount,
      phone: phone || user.phone,
      reference,
    });

    purchase.status = TRANSACTION_STATUS.SUCCESS;
    purchase.token = providerResult.token;
    purchase.units = providerResult.units;
    purchase.vtuProvider = providerResult.provider;
    purchase.providerReference = providerResult.providerReference;
    purchase.providerResponse = providerResult.response;
    purchase.completedAt = new Date();
    await purchase.save();

    await processCommission(userId, amount, TRANSACTION_TYPES.ELECTRICITY_PURCHASE, debitResult.transaction._id)
      .catch((e) => logger.error('Commission error:', e));

    return purchase;
  } catch (error) {
    purchase.status = TRANSACTION_STATUS.FAILED;
    purchase.failureReason = error.message;
    await purchase.save();
    await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amount } });
    throw Object.assign(new Error(`Electricity purchase failed: ${error.message}`), { statusCode: 502 });
  }
};

const getElectricityHistory = async (userId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    ElectricityPurchase.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    ElectricityPurchase.countDocuments({ user: userId }),
  ]);
  return { data, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

module.exports = { verifyMeter, purchaseElectricity, getElectricityHistory };
