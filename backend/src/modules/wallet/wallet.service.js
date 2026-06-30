const mongoose = require('mongoose');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { generateReference, paginate, paginateResponse } = require('../../utils/helpers');
const { TRANSACTION_TYPES, TRANSACTION_STATUS, WALLET_LIMITS } = require('../../config/constants');
const { notifyTransaction } = require('../notification/notification.service');

const fundWallet = async (userId, amount, gateway, externalReference, metadata = {}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    const balanceBefore = user.walletBalance;
    const balanceAfter = balanceBefore + amount;

    user.walletBalance = balanceAfter;
    await user.save({ session });

    const transaction = await Transaction.create([{
      user: userId,
      type: TRANSACTION_TYPES.WALLET_FUND,
      amount,
      balanceBefore,
      balanceAfter,
      status: TRANSACTION_STATUS.SUCCESS,
      reference: generateReference('WF'),
      externalReference,
      gateway,
      description: `Wallet funded via ${gateway}`,
      metadata,
      completedAt: new Date(),
    }], { session });

    await session.commitTransaction();

    notifyTransaction(userId, transaction[0]).catch(() => {});
    return { transaction: transaction[0], newBalance: balanceAfter };
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

  if (amount < WALLET_LIMITS.MIN_TRANSFER) {
    throw Object.assign(new Error(`Minimum transfer amount is ₦${WALLET_LIMITS.MIN_TRANSFER}`), { statusCode: 400 });
  }

  if (sender.walletBalance < amount) {
    throw Object.assign(new Error('Insufficient wallet balance'), { statusCode: 400 });
  }

  const recipient = await User.findOne({
    $or: [{ email: recipientIdentifier }, { phone: recipientIdentifier }, { referralCode: recipientIdentifier.toUpperCase() }],
  });

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
        metadata: { recipientId: recipient._id, recipientName: recipient.fullName },
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
        metadata: { senderId, senderName: sender.fullName },
        completedAt: new Date(),
      },
    ], { session });

    await session.commitTransaction();
    return { success: true, newBalance: senderBalanceAfter, recipient: { name: recipient.fullName } };
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

module.exports = { fundWallet, debitWallet, transferWallet, getWalletBalance, getTransactionHistory, setTransactionPin };
