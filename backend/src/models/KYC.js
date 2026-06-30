const mongoose = require('mongoose');
const { KYC_APPROVAL_STATUS } = require('../config/constants');

const kycSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tier: { type: Number, enum: [1, 2, 3], required: true },
    status: { type: String, enum: Object.values(KYC_APPROVAL_STATUS), default: KYC_APPROVAL_STATUS.PENDING },

    // Tier 1: Phone
    phoneVerified: { type: Boolean, default: false },
    phoneVerifiedAt: Date,

    // Tier 2: ID Document
    idType: { type: String, enum: ['nin', 'drivers_license', 'passport', 'voters_card'] },
    idNumber: String,
    idFrontImage: String,
    idBackImage: String,

    // Tier 3: Selfie
    selfieImage: String,
    livenessScore: Number,

    bvn: String,

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    rejectionReason: String,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

kycSchema.index({ user: 1, tier: 1 });
kycSchema.index({ status: 1 });

module.exports = mongoose.model('KYC', kycSchema);
