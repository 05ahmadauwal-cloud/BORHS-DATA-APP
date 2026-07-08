const EducationPurchase = require('../../models/EducationPurchase');
const User = require('../../models/User');
const { debitWallet } = require('../wallet/wallet.service');
const { withFallback } = require('../../services/providers');
const { generateReference } = require('../../utils/helpers');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../../config/constants');
const { processCommission } = require('../agent/agent.service');
const logger = require('../../utils/logger');

const EXAM_PRICES = {
  waec: 4200,
  neco: 1000,
  nabteb: 1500,
  jamb: 4700,
};

const getExamPrices = () => EXAM_PRICES;

const purchaseExamPin = async (userId, body) => {
  const { examType, quantity = 1 } = body;

  const unitPrice = EXAM_PRICES[examType];
  if (!unitPrice) throw Object.assign(new Error('Invalid exam type'), { statusCode: 400 });
  if (quantity < 1 || quantity > 10) throw Object.assign(new Error('Quantity must be between 1 and 10'), { statusCode: 400 });

  const totalAmount = unitPrice * quantity;
  const user = await User.findById(userId).select('+transactionPin');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  // Require and validate transaction PIN
  const { pin } = body;
  if (!user.isPinSet) throw Object.assign(new Error('Transaction PIN not set. Please set a PIN to continue.'), { statusCode: 400 });
  if (!pin || !/^\d{4}$/.test(String(pin))) throw Object.assign(new Error('Transaction PIN must be a 4-digit code'), { statusCode: 400 });
  const pinOk = await user.comparePin(String(pin));
  if (!pinOk) throw Object.assign(new Error('Invalid transaction PIN'), { statusCode: 401 });

  if (user.walletBalance < totalAmount) {
    throw Object.assign(new Error('Insufficient wallet balance'), { statusCode: 400 });
  }

  const reference = generateReference('EDU');

  const purchase = await EducationPurchase.create({
    user: userId,
    examType,
    quantity,
    amount: totalAmount,
    reference,
    status: TRANSACTION_STATUS.PENDING,
  });

  try {
    const debitResult = await debitWallet(
      userId, totalAmount, TRANSACTION_TYPES.EDUCATION_PURCHASE,
      `${quantity}x ${examType.toUpperCase()} PIN(s)`,
      { examType, quantity }
    );
    purchase.transaction = debitResult.transaction._id;

    const providerResult = await withFallback('purchaseExamPin', {
      examType,
      quantity,
      amount: totalAmount,
      reference,
    });

    purchase.status = TRANSACTION_STATUS.SUCCESS;
    purchase.pins = providerResult.pins;
    purchase.vtuProvider = providerResult.provider;
    purchase.providerReference = providerResult.providerReference;
    purchase.providerResponse = providerResult.response;
    purchase.completedAt = new Date();
    await purchase.save();

    await processCommission(userId, totalAmount, TRANSACTION_TYPES.EDUCATION_PURCHASE, debitResult.transaction._id)
      .catch((e) => logger.error('Commission error:', e));

    return purchase;
  } catch (error) {
    purchase.status = TRANSACTION_STATUS.FAILED;
    purchase.failureReason = error.message;
    await purchase.save();
    await User.findByIdAndUpdate(userId, { $inc: { walletBalance: totalAmount } });
    throw Object.assign(new Error(`Exam PIN purchase failed: ${error.message}`), { statusCode: 502 });
  }
};

const getEducationHistory = async (userId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    EducationPurchase.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    EducationPurchase.countDocuments({ user: userId }),
  ]);
  return { data, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

module.exports = { getExamPrices, purchaseExamPin, getEducationHistory };
