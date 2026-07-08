const CablePurchase = require('../../models/CablePurchase');
const User = require('../../models/User');
const { debitWallet } = require('../wallet/wallet.service');
const { withFallback, getProvider } = require('../../services/providers');
const { generateReference } = require('../../utils/helpers');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../../config/constants');
const { processCommission } = require('../agent/agent.service');
const logger = require('../../utils/logger');

const CABLE_PACKAGES = {
  dstv: [
    { id: 'padi', name: 'DStv Padi', amount: 2950 },
    { id: 'yanga', name: 'DStv Yanga', amount: 3970 },
    { id: 'confam', name: 'DStv Confam', amount: 6200 },
    { id: 'compact', name: 'DStv Compact', amount: 10500 },
    { id: 'compact-plus', name: 'DStv Compact Plus', amount: 16600 },
    { id: 'premium', name: 'DStv Premium', amount: 29500 },
  ],
  gotv: [
    { id: 'smallie', name: 'GOtv Smallie', amount: 900 },
    { id: 'jinja', name: 'GOtv Jinja', amount: 1900 },
    { id: 'jolli', name: 'GOtv Jolli', amount: 3000 },
    { id: 'max', name: 'GOtv Max', amount: 4850 },
    { id: 'supa', name: 'GOtv Supa', amount: 6400 },
  ],
  startimes: [
    { id: 'nova', name: 'Startimes Nova', amount: 900 },
    { id: 'basic', name: 'Startimes Basic', amount: 1850 },
    { id: 'smart', name: 'Startimes Smart', amount: 2690 },
    { id: 'classic', name: 'Startimes Classic', amount: 3000 },
    { id: 'super', name: 'Startimes Super', amount: 4900 },
  ],
};

const getCablePackages = (provider) => {
  if (provider && CABLE_PACKAGES[provider]) return CABLE_PACKAGES[provider];
  return CABLE_PACKAGES;
};

const verifySmartCard = async (provider, smartCardNumber) => {
  const p = getProvider();
  return p.verifySmartCard({ provider, smartCardNumber });
};

const purchaseCable = async (userId, body) => {
  const { provider, smartCardNumber, packageId, phone } = body;

  const packages = CABLE_PACKAGES[provider];
  if (!packages) throw Object.assign(new Error('Invalid cable provider'), { statusCode: 400 });

  const selectedPkg = packages.find((p) => p.id === packageId);
  if (!selectedPkg) throw Object.assign(new Error('Invalid package'), { statusCode: 400 });

  const amount = selectedPkg.amount;
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

  let customerName = '';
  try {
    const info = await verifySmartCard(provider, smartCardNumber);
    customerName = info.customerName;
  } catch (e) {
    logger.warn('Smart card verification failed, proceeding anyway');
  }

  const reference = generateReference('CABLE');

  const purchase = await CablePurchase.create({
    user: userId,
    provider,
    smartCardNumber,
    customerName,
    packageId,
    packageName: selectedPkg.name,
    amount,
    reference,
    status: TRANSACTION_STATUS.PENDING,
  });

  try {
    const debitResult = await debitWallet(
      userId, amount, TRANSACTION_TYPES.CABLE_PURCHASE,
      `${selectedPkg.name} for smartcard ${smartCardNumber}`,
      { provider, smartCardNumber, packageId }
    );
    purchase.transaction = debitResult.transaction._id;

    const providerResult = await withFallback('purchaseCable', {
      provider, smartCardNumber, packageCode: packageId,
      amount, phone: phone || user.phone, reference,
    });

    purchase.status = TRANSACTION_STATUS.SUCCESS;
    purchase.vtuProvider = providerResult.provider;
    purchase.providerReference = providerResult.providerReference;
    purchase.providerResponse = providerResult.response;
    purchase.completedAt = new Date();
    await purchase.save();

    await processCommission(userId, amount, TRANSACTION_TYPES.CABLE_PURCHASE, debitResult.transaction._id)
      .catch((e) => logger.error('Commission error:', e));

    return purchase;
  } catch (error) {
    purchase.status = TRANSACTION_STATUS.FAILED;
    purchase.failureReason = error.message;
    await purchase.save();
    await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amount } });
    throw Object.assign(new Error(`Cable subscription failed: ${error.message}`), { statusCode: 502 });
  }
};

const getCableHistory = async (userId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    CablePurchase.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    CablePurchase.countDocuments({ user: userId }),
  ]);
  return { data, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

module.exports = { getCablePackages, verifySmartCard, purchaseCable, getCableHistory };
