const mongoose = require('mongoose');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const Settings = require('../../models/Settings');
const { generateReference, paginate, paginateResponse } = require('../../utils/helpers');
const { TRANSACTION_TYPES, TRANSACTION_STATUS, WALLET_LIMITS } = require('../../config/constants');
const { notifyTransaction } = require('../notification/notification.service');

const CHARGEABLE_GATEWAYS = ['paystack', 'monnify', 'flutterwave'];

const computeDepositCharge = async (amount, gateway) => {
  if (!CHARGEABLE_GATEWAYS.includes(gateway)) return { fee: 0, creditAmount: amount };
  const [chargeType, chargeValue] = await Promise.all([
    Settings.get('deposit_charge_type', 'none'),
    Settings.get('deposit_charge_value', 0),
  ]);
  const val = parseFloat(chargeValue) || 0;
  if (!val || chargeType === 'none') return { fee: 0, creditAmount: amount };
  const fee = chargeType === 'percentage' ? Math.round((amount * val) / 100 * 100) / 100 : val;
  return { fee, creditAmount: Math.max(0, amount - fee) };
};

const fundWallet = async (userId, amount, gateway, externalReference, metadata = {}) => {
  const { fee, creditAmount } = await computeDepositCharge(amount, gateway);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    const balanceBefore = user.walletBalance;
    const balanceAfter = balanceBefore + creditAmount;

    user.walletBalance = balanceAfter;
    await user.save({ session });

    const transaction = await Transaction.create([{
      user: userId,
      type: TRANSACTION_TYPES.WALLET_FUND,
      amount: creditAmount,
      balanceBefore,
      balanceAfter,
      status: TRANSACTION_STATUS.SUCCESS,
      reference: generateReference('WF'),
      externalReference,
      gateway,
      description: fee > 0
        ? `Wallet funded via ${gateway} (₦${fee} fee deducted)`
        : `Wallet funded via ${gateway}`,
      metadata: { ...metadata, amountPaid: amount, fee, creditAmount },
      completedAt: new Date(),
    }], { session });

    await session.commitTransaction();

    notifyTransaction(userId, transaction[0]).catch(() => {});
    return { transaction: transaction[0], newBalance: balanceAfter, fee, creditAmount };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const debitWallet = async (userId, amount, type, description, metadata = {}, session = null) => {
  const ownSession = !session;
  if (ownSession) session = await mongoose.startSession();

  try {
    if (ownSession) session.startTransaction();

    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');
    if (user.walletBalance < amount) {
      throw Object.assign(new Error('Insufficient wallet balance'), { statusCode: 400 });
    }

    const balanceBefore = user.walletBalance;
    const balanceAfter = balanceBefore - amount;
    user.walletBalance = balanceAfter;
    await user.save({ session });

    const reference = generateReference('DB');
    const transaction = await Transaction.create([{
      user: userId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      status: TRANSACTION_STATUS.SUCCESS,
      reference,
      gateway: 'wallet',
      description,
      metadata,
      completedAt: new Date(),
    }], { session });

    if (ownSession) await session.commitTransaction();
    return { transaction: transaction[0], newBalance: balanceAfter, reference };
  } catch (error) {
    if (ownSession) await session.abortTransaction();
    throw error;
  } finally {
    if (ownSession) session.endSession();
  }
};

const transferWallet = async (senderId, recipientIdentifier, amount, pin) => {
  const sender = await User.findById(senderId).select('+transactionPin');
  if (!sender) throw new Error('Sender not found');

  if (sender.isPinSet) {
    const pinValid = await sender.comparePin(pin);
    if (!pinValid) throw Object.assign(new Error('Invalid transaction PIN'), { statusCode: 400 });
  }

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount < WALLET_LIMITS.MIN_TRANSFER) {
    throw Object.assign(new Error(`Minimum transfer amount is ₦${WALLET_LIMITS.MIN_TRANSFER}`), { statusCode: 400 });
  }

  if (sender.walletBalance < amount) {
    throw Object.assign(new Error('Insufficient wallet balance'), { statusCode: 400 });
  }

  const normalizePhone = (phone) => phone?.toString().replace(/\D/g, '').slice(-10) || '';
  const cleanedIdentifier = String(recipientIdentifier || '').trim();
  const normalizedIdentifier = normalizePhone(cleanedIdentifier);

  const queryClauses = [];
  if (cleanedIdentifier) {
    queryClauses.push({ email: cleanedIdentifier.toLowerCase() });
    queryClauses.push({ referralCode: cleanedIdentifier.toUpperCase() });
  }
  if (normalizedIdentifier.length === 10) {
    queryClauses.push({ phone: { $regex: `${normalizedIdentifier}$` } });
  }

  if (queryClauses.length === 0) {
    throw Object.assign(new Error('Recipient not found'), { statusCode: 404 });
  }

  let recipient = await User.findOne({ $or: queryClauses });

  if (!recipient) {
    // Last-resort phone normalization search on stored phone values.
    const allUsers = await User.find({ phone: { $exists: true } }).select('_id phone firstName lastName email walletBalance');
    recipient = allUsers.find((u) => normalizePhone(u.phone) === normalizedIdentifier);
  }

  if (!recipient) throw Object.assign(new Error('Recipient not found'), { statusCode: 404 });
  if (recipient._id.toString() === senderId.toString()) {
    throw Object.assign(new Error('Cannot transfer to yourself'), { statusCode: 400 });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const senderBalanceBefore = sender.walletBalance;
    const senderBalanceAfter = senderBalanceBefore - amount;
    const recipientBalanceBefore = recipient.walletBalance;
    const recipientBalanceAfter = recipientBalanceBefore + amount;

    await User.findByIdAndUpdate(senderId, { walletBalance: senderBalanceAfter }, { session });
    await User.findByIdAndUpdate(recipient._id, { walletBalance: recipientBalanceAfter }, { session });

    const ref = generateReference('TF');
    await Transaction.create([
      {
        user: senderId,
        type: TRANSACTION_TYPES.WALLET_TRANSFER,
        amount,
        balanceBefore: senderBalanceBefore,
        balanceAfter: senderBalanceAfter,
        status: TRANSACTION_STATUS.SUCCESS,
        reference: ref,
        gateway: 'wallet',
        description: `Transfer to ${recipient.firstName} ${recipient.lastName}`,
        metadata: { recipientId: recipient._id, recipientName: `${recipient.firstName} ${recipient.lastName}` },
        completedAt: new Date(),
      },
      {
        user: recipient._id,
        type: TRANSACTION_TYPES.WALLET_FUND,
        amount,
        balanceBefore: recipientBalanceBefore,
        balanceAfter: recipientBalanceAfter,
        status: TRANSACTION_STATUS.SUCCESS,
        reference: generateReference('TF'),
        gateway: 'wallet',
        description: `Transfer from ${sender.firstName} ${sender.lastName}`,
        metadata: { senderId, senderName: `${sender.firstName} ${sender.lastName}` },
        completedAt: new Date(),
      },
    ], { session, ordered: true });

    await session.commitTransaction();
    return { success: true, newBalance: senderBalanceAfter, recipient: { name: `${recipient.firstName} ${recipient.lastName}` } };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getWalletBalance = async (userId) => {
  const user = await User.findById(userId).select('walletBalance bonusBalance');
  if (!user) throw new Error('User not found');
  return { walletBalance: user.walletBalance, bonusBalance: user.bonusBalance };
};

const getTransactionHistory = async (userId, query = {}) => {
  const { page = 1, limit = 20, type, status, startDate, endDate } = query;
  const { skip, limit: lim } = paginate(page, limit);

  const filter = { user: userId };
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    Transaction.countDocuments(filter),
  ]);

  return paginateResponse(transactions, total, page, lim);
};

const setTransactionPin = async (userId, pin) => {
  if (pin.length !== 4 || !/^\d+$/.test(pin)) {
    throw Object.assign(new Error('PIN must be exactly 4 digits'), { statusCode: 400 });
  }
  const user = await User.findById(userId);
  user.transactionPin = pin;
  user.isPinSet = true;
  await user.save();
  return true;
};

const resetTransactionPin = async (userId, loginPassword, newPin) => {
  if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
    throw Object.assign(new Error('PIN must be exactly 4 digits'), { statusCode: 400 });
  }
  const user = await User.findById(userId).select('+password');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  const passwordMatch = await user.comparePassword(loginPassword);
  if (!passwordMatch) {
    throw Object.assign(new Error('Incorrect password'), { statusCode: 400 });
  }
  user.transactionPin = newPin;
  user.isPinSet = true;
  await user.save();
  return true;
};

module.exports = { fundWallet, debitWallet, transferWallet, getWalletBalance, getTransactionHistory, setTransactionPin, resetTransactionPin };
