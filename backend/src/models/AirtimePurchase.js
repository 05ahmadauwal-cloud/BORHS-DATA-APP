const mongoose = require('mongoose');
const { NETWORKS, TRANSACTION_STATUS, VTU_PROVIDERS } = require('../config/constants');

const airtimePurchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    network: { type: String, enum: Object.values(NETWORKS), required: true },
    phone: { type: String, required: true },
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    amountSent: { type: Number },
    provider: { type: String, enum: Object.values(VTU_PROVIDERS) },
    providerReference: String,
    status: { type: String, enum: Object.values(TRANSACTION_STATUS), default: TRANSACTION_STATUS.PENDING },
    reference: { type: String, required: true, unique: true },
    isBulk: { type: Boolean, default: false },
    bulkRecipients: [{ phone: String, amount: Number, status: String }],
    failureReason: String,
    completedAt: Date,
    providerResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

airtimePurchaseSchema.index({ user: 1, createdAt: -1 });
airtimePurchaseSchema.index({ phone: 1 });
airtimePurchaseSchema.index({ status: 1 });

module.exports = mongoose.model('AirtimePurchase', airtimePurchaseSchema);
