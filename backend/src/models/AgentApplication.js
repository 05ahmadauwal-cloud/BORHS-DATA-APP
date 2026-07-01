const mongoose = require('mongoose');

const agentApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    amountPaid: { type: Number, required: true },
    transactionRef: { type: String, required: true },
    rejectionReason: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

agentApplicationSchema.index({ status: 1 });

module.exports = mongoose.model('AgentApplication', agentApplicationSchema);
