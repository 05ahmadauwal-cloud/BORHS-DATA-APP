const mongoose = require('mongoose');
const { NETWORKS, DATA_TYPES } = require('../config/constants');

const dataPlanSchema = new mongoose.Schema(
  {
    network: { type: String, enum: Object.values(NETWORKS), required: true },
    dataType: { type: String, enum: Object.values(DATA_TYPES), required: true },
    planId: { type: String, required: true },
    name: { type: String, required: true },
    dataSize: { type: String, required: true },
    validity: String,
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    agentPrice: { type: Number },
    resellerPrice: { type: Number },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    providerPlanCode: String,
  },
  { timestamps: true }
);

dataPlanSchema.index({ network: 1, dataType: 1, isActive: 1 });
dataPlanSchema.index({ planId: 1 });

module.exports = mongoose.model('DataPlan', dataPlanSchema);
