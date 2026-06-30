const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: Number, enum: [1, 2, 3], required: true },
    totalEarnings: { type: Number, default: 0 },
    commissions: [
      {
        transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
        transactionAmount: Number,
        commissionRate: Number,
        commissionAmount: Number,
        type: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

referralSchema.index({ referrer: 1 });
referralSchema.index({ referred: 1 });
referralSchema.index({ level: 1 });

module.exports = mongoose.model('Referral', referralSchema);
