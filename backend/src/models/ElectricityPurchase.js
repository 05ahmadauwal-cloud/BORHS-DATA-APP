const mongoose = require('mongoose');
const { ELECTRICITY_PROVIDERS, TRANSACTION_STATUS, VTU_PROVIDERS } = require('../config/constants');

const electricityPurchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    provider: { type: String, enum: Object.values(ELECTRICITY_PROVIDERS), required: true },
    meterNumber: { type: String, required: true },
    meterType: { type: String, enum: ['prepaid', 'postpaid'], required: true },
    customerName: String,
    customerAddress: String,
    amount: { type: Number, required: true },
    units: String,
    token: String,
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

electricityPurchaseSchema.index({ user: 1, createdAt: -1 });
electricityPurchaseSchema.index({ meterNumber: 1 });
electricityPurchaseSchema.index({ status: 1 });

module.exports = mongoose.model('ElectricityPurchase', electricityPurchaseSchema);
