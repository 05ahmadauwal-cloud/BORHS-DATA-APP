const mongoose = require('mongoose');
const { NETWORKS, DATA_TYPES, TRANSACTION_STATUS, VTU_PROVIDERS } = require('../config/constants');

const dataPurchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    network: { type: String, enum: Object.values(NETWORKS), required: true },
    dataType: { type: String, enum: Object.values(DATA_TYPES), required: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    dataSize: { type: String, required: true },
    validity: { type: String },
    phone: { type: String, required: true },
    recipientPhone: { type: String },
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    provider: { type: String, enum: Object.values(VTU_PROVIDERS) },
    providerReference: String,
    token: String,
    status: { type: String, enum: Object.values(TRANSACTION_STATUS), default: TRANSACTION_STATUS.PENDING },
    reference: { type: String, required: true, unique: true },
    failureReason: String,
    completedAt: Date,
    providerResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

dataPurchaseSchema.index({ user: 1, createdAt: -1 });
dataPurchaseSchema.index({ phone: 1 });
dataPurchaseSchema.index({ network: 1 });
dataPurchaseSchema.index({ status: 1 });

module.exports = mongoose.model('DataPurchase', dataPurchaseSchema);
