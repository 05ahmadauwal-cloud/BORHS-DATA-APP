const mongoose = require('mongoose');
const { EXAM_TYPES, TRANSACTION_STATUS, VTU_PROVIDERS } = require('../config/constants');

const educationPurchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    examType: { type: String, enum: Object.values(EXAM_TYPES), required: true },
    quantity: { type: Number, default: 1 },
    amount: { type: Number, required: true },
    pins: [
      {
        serial: String,
        pin: String,
        used: { type: Boolean, default: false },
      },
    ],
    vtuProvider: { type: String, enum: Object.values(VTU_PROVIDERS) },
    providerReference: String,
    status: { type: String, enum: Object.values(TRANSACTION_STATUS), default: TRANSACTION_STATUS.PENDING },
    reference: { type: String, required: true, unique: true },
    failureReason: String,
    completedAt: Date,
    providerResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

educationPurchaseSchema.index({ user: 1, createdAt: -1 });
educationPurchaseSchema.index({ examType: 1 });
educationPurchaseSchema.index({ status: 1 });

module.exports = mongoose.model('EducationPurchase', educationPurchaseSchema);
