const mongoose = require('mongoose');

const recipientListSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  numbers: [{ type: String, required: true }],
}, { timestamps: true });

recipientListSchema.index({ user: 1, name: 1 }, { unique: true });
module.exports = mongoose.model('RecipientList', recipientListSchema);
