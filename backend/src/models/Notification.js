const mongoose = require('mongoose');
const { NOTIFICATION_TYPES, NOTIFICATION_EVENTS } = require('../config/constants');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPES), required: true },
    event: { type: String, enum: Object.values(NOTIFICATION_EVENTS) },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    deliveryStatus: {
      email: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
      sms: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
      whatsapp: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
