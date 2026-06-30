const mongoose = require('mongoose');
const { CABLE_PROVIDERS, TRANSACTION_STATUS, VTU_PROVIDERS } = require('../config/constants');

const cablePurchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    provider: { type: String, enum: Object.values(CABLE_PROVIDERS), required: true },
    smartCardNumber: { type: String, required: true },
    customerName: String,
    packageId: String,
    packageName: String,
    amount: { type: Number, required: true },
    durationMonths: { type: Number, default: 1 },
    renewalDate: Date,
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

cablePurchaseSchema.index({ user: 1, createdAt: -1 });
cablePurchaseSchema.index({ smartCardNumber: 1 });
cablePurchaseSchema.index({ status: 1 });

module.exports = mongoose.model('CablePurchase', cablePurchaseSchema);
