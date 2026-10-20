const Donation = require('../models/Donation');
const Donor = require('../models/Donor');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const BloodInventory = require('../models/BloodInventory');
const BloodUnitTransaction = require('../models/BloodUnitTransaction');
const Notification = require('../models/Notification');
const { DONATION_STATUS } = require('../models/Donation');
const { NOTIFICATION_TYPES, ROLES } = require('../config/constants');
const { getAuthenticatedHospital } = require('../utils/authHelpers');

const ALLOWED_TRANSITIONS = {
  DONATION_REQUESTED: [DONATION_STATUS.SCHEDULED, DONATION_STATUS.APPROVED, DONATION_STATUS.CANCELLED, DONATION_STATUS.REJECTED, DONATION_STATUS.UNDER_REVIEW],
  UNDER_REVIEW: [DONATION_STATUS.SCHEDULED, DONATION_STATUS.APPROVED, DONATION_STATUS.REJECTED, DONATION_STATUS.CANCELLED],
  APPROVED: [DONATION_STATUS.SCHEDULED, DONATION_STATUS.CHECK_IN, DONATION_STATUS.DONATED, DONATION_STATUS.CANCELLED, DONATION_STATUS.REJECTED],
  SCHEDULED: [DONATION_STATUS.CHECK_IN, DONATION_STATUS.CANCELLED, DONATION_STATUS.DEFERRED, DONATION_STATUS.APPROVED],
  CHECK_IN: [DONATION_STATUS.DONATED, DONATION_STATUS.SCREENING, DONATION_STATUS.CANCELLED, DONATION_STATUS.DEFERRED],
  SCREENING: [DONATION_STATUS.APPROVED, DONATION_STATUS.REJECTED, DONATION_STATUS.DEFERRED],
  DONATED: [DONATION_STATUS.TESTING, DONATION_STATUS.AVAILABLE],
  TESTING: [DONATION_STATUS.AVAILABLE, DONATION_STATUS.APPROVED, DONATION_STATUS.REJECTED],
  AVAILABLE: [],
  CANCELLED: [],
  REJECTED: [],
  DEFERRED: []
};

const ACTIVE_STATUSES = [
  DONATION_STATUS.DONATION_REQUESTED,
  DONATION_STATUS.UNDER_REVIEW,
  DONATION_STATUS.SCHEDULED,
  DONATION_STATUS.CHECK_IN,
  DONATION_STATUS.SCREENING,
  DONATION_STATUS.APPROVED,
  DONATION_STATUS.DONATED,
  DONATION_STATUS.TESTING
];

// @desc    Create a new blood donation request
// @route   POST /api/donations
// @access  Private (Donor)
const createDonation = async (req, res, next) => {
  try {
    const donorProfile = await Donor.findOne({ userId: req.user._id });
    if (!donorProfile) {
      return res.status(404).json({ success: false, message: 'Donor profile not found. Please complete your profile first.' });
    }

    // Check for existing active donation request
    const activeDonation = await Donation.findOne({
      donorId: donorProfile._id,
      status: { $in: ACTIVE_STATUSES }
    });

    if (activeDonation) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active donation request.',
        activeDonationId: activeDonation._id,
        status: activeDonation.status
      });
    }

    const { hospitalId, preferredDate, preferredTime, location, donationType, healthDeclaration, notes } = req.body;

    if (!preferredDate || !preferredTime) {
      return res.status(400).json({ success: false, message: 'Preferred date and time are required.' });
    }

    if (!hospitalId) {
      return res.status(400).json({ success: false, message: 'Target hospital selection is required.' });
    }

    const targetHospital = await Hospital.findById(hospitalId);
    if (!targetHospital) {
      return res.status(404).json({ success: false, message: 'Selected hospital not found.' });
    }

    const reqDate = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reqDate < today) {
      return res.status(400).json({ success: false, message: 'Preferred donation date cannot be in the past.' });
    }

    const donationId = `DON-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;

    const donation = await Donation.create({
      donationId,
      donorId: donorProfile._id,
      userId: req.user._id,
      hospitalId: targetHospital._id,
      bloodGroup: donorProfile.bloodGroup,
      preferredDate: reqDate,
      preferredTime,
      location: location || `${targetHospital.hospitalName}, ${targetHospital.city}`,
      donationType: donationType || 'Whole Blood',
      status: DONATION_STATUS.DONATION_REQUESTED,
      healthDeclaration: healthDeclaration || {},
      notes: notes || '',
      statusHistory: [
        {
          status: DONATION_STATUS.DONATION_REQUESTED,
          changedBy: req.user._id,
          changedAt: new Date(),
          notes: `Donation request submitted by donor targeting ${targetHospital.hospitalName}.`
        }
      ]
    });

    // Notify donor
    await Notification.create({
      userId: req.user._id,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: '🩸 Donation Request Submitted',
      message: `Your blood donation request (${donationId}) for ${targetHospital.hospitalName} has been received.`
    });

    // Notify target hospital user
    if (targetHospital.userId) {
      await Notification.create({
        userId: targetHospital.userId,
        type: NOTIFICATION_TYPES.SYSTEM,
        title: '🆕 New Donor Donation Request',
        message: `New ${donorProfile.bloodGroup} donation request (${donationId}) submitted by ${req.user.name}.`
      });
    }

    // Notify admins
    const admins = await User.find({ role: ROLES.ADMIN });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        type: NOTIFICATION_TYPES.SYSTEM,
        title: '🆕 New Donor Donation Request',
        message: `New ${donorProfile.bloodGroup} donation request (${donationId}) submitted for ${targetHospital.hospitalName}.`
      });
    }

    res.status(201).json({
      success: true,
      donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current donor's donation requests
// @route   GET /api/donations/my
// @access  Private (Donor)
const getMyDonations = async (req, res, next) => {
  try {
    const donorProfile = await Donor.findOne({ userId: req.user._id });
    if (!donorProfile) {
      return res.json({ success: true, count: 0, donations: [] });
    }

    const donations = await Donation.find({ donorId: donorProfile._id })
      .populate('hospitalId', 'hospitalName city phone email address')
      .populate('bloodUnitRef')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donation details by ID
// @route   GET /api/donations/:id
// @access  Private
const getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donorId')
      .populate('hospitalId', 'hospitalName registrationNumber contactPerson phone email city address')
      .populate('userId', 'name email phone address')
      .populate('bloodUnitRef');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    // Security checks:
    if (req.user.role === ROLES.HOSPITAL) {
      const hospital = await getAuthenticatedHospital(req);
      if (!hospital || donation.hospitalId?._id.toString() !== hospital._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this donation' });
      }
    } else if (req.user.role === ROLES.DONOR) {
      if (donation.userId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to view this donation record.' });
      }
    }

    res.json({
      success: true,
      donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel donation request by donor
// @route   PATCH /api/donations/:id/cancel
// @access  Private (Donor)
const cancelDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    if (donation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this donation.' });
    }

    const cancellable = [DONATION_STATUS.DONATION_REQUESTED, DONATION_STATUS.SCHEDULED, DONATION_STATUS.UNDER_REVIEW];
    if (!cancellable.includes(donation.status)) {
      return res.status(400).json({ success: false, message: `Donation cannot be cancelled when status is ${donation.status}.` });
    }

    donation.status = DONATION_STATUS.CANCELLED;
    donation.statusHistory.push({
      status: DONATION_STATUS.CANCELLED,
      changedBy: req.user._id,
      changedAt: new Date(),
      notes: req.body.reason || 'Cancelled by donor.'
    });

    await donation.save();

    await Notification.create({
      userId: req.user._id,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: '❌ Donation Cancelled',
      message: `Your donation request (${donation.donationId}) has been cancelled.`
    });

    res.json({
      success: true,
      message: 'Donation cancelled successfully.',
      donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donation requests (Server-side hospital isolation enforced)
// @route   GET /api/donations
// @access  Private (Admin, Hospital)
const getAllDonations = async (req, res, next) => {
  try {
    const { status, bloodGroup, search } = req.query;
    const query = {};

    // Hospital user: strictly scope by authenticated hospital ID
    if (req.user.role === ROLES.HOSPITAL) {
      const hospital = await getAuthenticatedHospital(req);
      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital profile not found for logged in user.' });
      }
      query.hospitalId = hospital._id;
    }

    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    let donations = await Donation.find(query)
      .populate('donorId')
      .populate('hospitalId', 'hospitalName registrationNumber phone email city')
      .populate('userId', 'name email phone')
      .populate('bloodUnitRef')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      donations = donations.filter(d =>
        d.donationId.toLowerCase().includes(s) ||
        (d.userId && d.userId.name && d.userId.name.toLowerCase().includes(s)) ||
        (d.userId && d.userId.email && d.userId.email.toLowerCase().includes(s)) ||
        (d.hospitalId && d.hospitalId.hospitalName && d.hospitalId.hospitalName.toLowerCase().includes(s))
      );
    }

    res.json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donation status (Hospital / Admin workflow processing)
// @route   PATCH /api/donations/:id/status
// @access  Private (Admin, Hospital)
const updateDonationStatus = async (req, res, next) => {
  try {
    const { status: targetStatus, notes, rejectionReason, deferralReason, preferredDate, preferredTime } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    // Security check: Hospital user can ONLY modify donations belonging to their hospital
    if (req.user.role === ROLES.HOSPITAL) {
      const hospital = await getAuthenticatedHospital(req);
      if (!hospital || donation.hospitalId.toString() !== hospital._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to update this donation' });
      }
    }

    const currentStatus = donation.status;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed next states: [${allowed.join(', ')}]`
      });
    }

    donation.status = targetStatus;
    if (notes) donation.notes = notes;
    if (rejectionReason) donation.rejectionReason = rejectionReason;
    if (deferralReason) donation.deferralReason = deferralReason;
    if (preferredDate) donation.preferredDate = new Date(preferredDate);
    if (preferredTime) donation.preferredTime = preferredTime;

    donation.statusHistory.push({
      status: targetStatus,
      changedBy: req.user._id,
      changedAt: new Date(),
      notes: notes || rejectionReason || `Status updated from ${currentStatus} to ${targetStatus}`
    });

    // If screening status updated
    if (targetStatus === DONATION_STATUS.APPROVED || targetStatus === DONATION_STATUS.REJECTED || targetStatus === DONATION_STATUS.DEFERRED) {
      donation.screeningResult = {
        screenedBy: req.user._id,
        screeningDate: new Date(),
        notes: notes || rejectionReason || '',
        passed: targetStatus === DONATION_STATUS.APPROVED
      };
    }

    // Critical step: When blood testing completes and unit becomes AVAILABLE
    if (targetStatus === DONATION_STATUS.AVAILABLE) {
      const unitId = `BD-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
      const now = new Date();
      const expiryDate = new Date(now.getTime() + 35 * 86400000);

      const bloodUnit = await BloodInventory.create({
        unitId,
        bloodGroup: donation.bloodGroup,
        component: donation.donationType || 'Whole Blood',
        quantity: 1,
        collectionDate: now,
        expiryDate,
        donorId: donation.donorId,
        storageLocation: 'Freezer A-1',
        status: 'AVAILABLE'
      });

      await BloodUnitTransaction.create({
        unitId,
        inventoryRef: bloodUnit._id,
        action: 'DONATED',
        statusTo: 'AVAILABLE',
        performedBy: req.user._id,
        quantity: 1,
        notes: `Donation ${donation.donationId} completed testing and verified available.`
      });

      // Update donor statistics idempotently (only once per available unit)
      if (!donation.bloodUnitRef) {
        await Donor.findByIdAndUpdate(donation.donorId, {
          $inc: { totalDonations: 1 },
          $set: { lastDonationDate: now }
        });
      }

      donation.bloodUnitRef = bloodUnit._id;
    }

    await donation.save();

    // Send status notification to donor
    let notifTitle = '🩸 Donation Status Update';
    let notifMsg = `Your blood donation (${donation.donationId}) status is now ${targetStatus}.`;

    if (targetStatus === DONATION_STATUS.SCHEDULED) {
      notifMsg = `Your donation appointment (${donation.donationId}) has been scheduled for ${new Date(donation.preferredDate).toLocaleDateString()}.`;
    } else if (targetStatus === DONATION_STATUS.APPROVED) {
      notifMsg = `Your health screening for donation ${donation.donationId} passed! Ready for blood collection.`;
    } else if (targetStatus === DONATION_STATUS.AVAILABLE) {
      notifMsg = `🎉 Thank you! Your donated blood unit (${donation.donationId}) completed lab testing and is now available to save lives.`;
    } else if (targetStatus === DONATION_STATUS.REJECTED) {
      notifMsg = `Your donation request (${donation.donationId}) was rejected. Reason: ${rejectionReason || 'Does not meet criteria'}.`;
    }

    await Notification.create({
      userId: donation.userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: notifTitle,
      message: notifMsg
    });

    res.json({
      success: true,
      message: `Donation status updated to ${targetStatus}`,
      donation
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  getMyDonations,
  getDonationById,
  cancelDonation,
  getAllDonations,
  updateDonationStatus
};
