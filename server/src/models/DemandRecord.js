const mongoose = require('mongoose');
const { BLOOD_GROUPS, BLOOD_COMPONENTS } = require('../config/constants');

const DemandRecordSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true
    },
    requestedUnits: {
      type: Number,
      default: 0
    },
    fulfilledUnits: {
      type: Number,
      default: 0
    },
    rejectedUnits: {
      type: Number,
      default: 0
    },
    emergencyRequests: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

DemandRecordSchema.index({ bloodGroup: 1, component: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DemandRecord', DemandRecordSchema);
