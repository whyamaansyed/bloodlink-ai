const mongoose = require('mongoose');
const { BLOOD_GROUPS, BLOOD_COMPONENTS } = require('../config/constants');

const DONATION_STATUS = {
  DONATION_REQUESTED: 'DONATION_REQUESTED',
  SCHEDULED: 'SCHEDULED',
  CHECK_IN: 'CHECK_IN',
  SCREENING: 'SCREENING',
  APPROVED: 'APPROVED',
  DONATED: 'DONATED',
  TESTING: 'TESTING',
  AVAILABLE: 'AVAILABLE',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  DEFERRED: 'DEFERRED'
};

const DonationSchema = new mongoose.Schema(
  {
    donationId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: [true, 'Blood group is required']
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Target hospital is required'],
      index: true
    },
    preferredDate: {
      type: Date,
      required: [true, 'Preferred donation date is required']
    },
    preferredTime: {
      type: String,
      required: [true, 'Preferred donation time is required']
    },
    location: {
      type: String,
      required: [true, 'Donation location is required'],
      default: 'Metropolis Central Blood Bank, 100 Medical Center Blvd'
    },
    donationType: {
      type: String,
      enum: ['Whole Blood', 'Packed Red Blood Cells', 'Plasma', 'Platelets'],
      default: 'Whole Blood'
    },
    status: {
      type: String,
      enum: Object.values(DONATION_STATUS),
      default: DONATION_STATUS.DONATION_REQUESTED,
      required: true
    },
    healthDeclaration: {
      feelingWell: { type: Boolean, default: true },
      noRecentIllness: { type: Boolean, default: true },
      noRecentMedication: { type: Boolean, default: true },
      noRecentSurgery: { type: Boolean, default: true },
      noRecentTattoo: { type: Boolean, default: true },
      accurateInfoConfirmed: { type: Boolean, default: true }
    },
    notes: {
      type: String,
      default: ''
    },
    screeningResult: {
      screenedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      screeningDate: { type: Date },
      notes: { type: String, default: '' },
      passed: { type: Boolean }
    },
    rejectionReason: {
      type: String,
      default: null
    },
    deferralReason: {
      type: String,
      default: null
    },
    bloodUnitRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodInventory',
      default: null
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        notes: { type: String, default: '' }
      }
    ]
  },
  {
    timestamps: true
  }
);

DonationSchema.index({ hospitalId: 1, status: 1 });

module.exports = mongoose.model('Donation', DonationSchema);
module.exports.DONATION_STATUS = DONATION_STATUS;
