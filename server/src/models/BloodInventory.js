const mongoose = require('mongoose');
const { BLOOD_GROUPS, BLOOD_COMPONENTS, INVENTORY_STATUS } = require('../config/constants');

const BloodInventorySchema = new mongoose.Schema(
  {
    unitId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: [true, 'Blood group is required']
    },
    component: {
      type: String,
      enum: BLOOD_COMPONENTS,
      required: [true, 'Component is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1 unit']
    },
    collectionDate: {
      type: Date,
      required: [true, 'Collection date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      default: null
    },
    storageLocation: {
      type: String,
      required: [true, 'Storage location is required'],
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(INVENTORY_STATUS),
      default: INVENTORY_STATUS.AVAILABLE
    }
  },
  {
    timestamps: true
  }
);

// Indexing for quick querying
BloodInventorySchema.index({ bloodGroup: 1, component: 1, status: 1, expiryDate: 1 });

module.exports = mongoose.model('BloodInventory', BloodInventorySchema);
