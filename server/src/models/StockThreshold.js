const mongoose = require('mongoose');
const { BLOOD_GROUPS, BLOOD_COMPONENTS } = require('../config/constants');

const StockThresholdSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true
    },
    component: {
      type: String,
      enum: BLOOD_COMPONENTS,
      required: true
    },
    minimumStock: {
      type: Number,
      default: 10,
      min: 0
    },
    criticalStock: {
      type: Number,
      default: 5,
      min: 0
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

StockThresholdSchema.index({ bloodGroup: 1, component: 1 }, { unique: true });

module.exports = mongoose.model('StockThreshold', StockThresholdSchema);
