const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: String,
    isPublic: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

settingsSchema.statics.get = async function (key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

settingsSchema.statics.set = async function (key, value, userId = null) {
  return this.findOneAndUpdate(
    { key },
    { value, updatedBy: userId },
    { upsert: true, new: true }
  );
};

settingsSchema.statics.getMany = async function (keys) {
  const settings = await this.find({ key: { $in: keys } });
  const result = {};
  settings.forEach((s) => (result[s.key] = s.value));
  return result;
};

module.exports = mongoose.model('Settings', settingsSchema);
