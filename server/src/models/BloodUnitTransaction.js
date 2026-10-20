const mongoose = require('mongoose');
const { INVENTORY_STATUS } = require('../config/constants');

const BloodUnitTransactionSchema = new mongoose.Schema(
  {
    unitId: {
      type: String,
      required: true
    },
    inventoryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodInventory',
      required: true
    },
    action: {
      type: String,
      enum: ['DONATED', 'STATUS_CHANGE', 'RESERVED', 'ISSUED', 'EXPIRED', 'DISCARDED'],
      required: true
    },
    statusFrom: {
      type: String,
      default: null
    },
    statusTo: {
      type: String,
      enum: Object.values(INVENTORY_STATUS),
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null
    },
    quantity: {
      type: Number,
      min: 1,
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('BloodUnitTransaction', BloodUnitTransactionSchema);
