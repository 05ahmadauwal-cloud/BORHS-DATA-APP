const Notification = require('../../models/Notification');
const User = require('../../models/User');
const { sendEmail } = require('../../services/emailService');
const { sendSMS, sendWhatsApp } = require('../../services/smsService');
const logger = require('../../utils/logger');

const createNotification = async (userId, { title, message, type, event, metadata = {} }) => {
  return Notification.create({ user: userId, title, message, type, event, metadata });
};

const notifyTransaction = async (userId, transaction) => {
  try {
    const user = await User.findById(userId).select('email phone firstName');
    if (!user) return;

    const { type, amount, reference, status } = transaction;
    const title = `Transaction Alert`;
    const message = `Your ${type.replace(/_/g, ' ')} of ₦${amount.toLocaleString()} is ${status}. Ref: ${reference}`;

    await createNotification(userId, {
      title,
      message,
      type: 'in_app',
      event: type,
      metadata: { transactionId: transaction._id, reference },
    });

    await sendEmail(user.email, 'transactionAlert', {
      firstName: user.firstName,
      type: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      amount: amount.toLocaleString(),
      reference,
      status,
      balance: transaction.balanceAfter?.toLocaleString() || '—',
      date: new Date().toLocaleString('en-NG'),
    }).catch((e) => logger.error('Email notify error:', e));

  } catch (e) {
    logger.error('Transaction notification error:', e.message);
  }
};

const getNotifications = async (userId, query = {}) => {
  const { page = 1, limit = 20, unreadOnly } = query;
  const skip = (page - 1) * limit;
  const filter = { user: userId };
  if (unreadOnly === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    data: notifications,
    unreadCount,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  };
};

const markAsRead = async (userId, notificationIds) => {
  if (notificationIds?.length) {
    await Notification.updateMany(
      { _id: { $in: notificationIds }, user: userId },
      { isRead: true, readAt: new Date() }
    );
  } else {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true, readAt: new Date() });
  }
  return true;
};

module.exports = { createNotification, notifyTransaction, getNotifications, markAsRead };
