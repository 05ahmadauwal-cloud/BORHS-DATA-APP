const mongoose = require('mongoose');

const autoRenewalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  serviceType: { type: String, enum: ['data', 'airtime'], required: true },
  label: { type: String, trim: true, maxlength: 100 },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  recipients: [{ phone: String, network: String, amount: Number, planId: String, dataType: String }],
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  paymentSource: { type: String, enum: ['main', 'reward', 'reward_first'], default: 'main' },
  nextRunAt: { type: Date, required: true, index: true },
  isActive: { type: Boolean, default: true, index: true },
  lastRunAt: Date,
  lastStatus: { type: String, enum: ['success', 'partial', 'failed'] },
  lastError: String,
}, { timestamps: true });

autoRenewalSchema.index({ isActive: 1, nextRunAt: 1 });
module.exports = mongoose.model('AutoRenewal', autoRenewalSchema);
