const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodInventory = require('../models/BloodInventory');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const { getDynamicStockSummary } = require('../services/inventoryService');
const { calculateDaysUntilExpiry } = require('../services/expiryService');
const { INVENTORY_STATUS, REQUEST_STATUS, ROLES } = require('../config/constants');

// @desc    Get top dashboard summary stats based on logged in user role
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === ROLES.ADMIN) {
      const totalDonors = await Donor.countDocuments();
      const totalHospitals = await Hospital.countDocuments();
      const pendingRequests = await BloodRequest.countDocuments({ status: REQUEST_STATUS.PENDING });
      const emergencyRequests = await BloodRequest.countDocuments({ urgency: 'EMERGENCY', status: { $in: [REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED] } });

      const stockSummary = await getDynamicStockSummary();
      const lowStockGroups = stockSummary.detailedMatrix.filter(m => m.status === 'LOW STOCK' || m.status === 'CRITICAL');

      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const expiringSoon = await BloodInventory.countDocuments({
        status: INVENTORY_STATUS.AVAILABLE,
        expiryDate: { $gt: now, $lte: sevenDaysFromNow }
      });

      // Recent items
      const recentRequests = await BloodRequest.find()
        .populate('hospitalId', 'hospitalName city')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentDonations = await BloodInventory.find({ donorId: { $ne: null } })
        .populate({
          path: 'donorId',
          populate: { path: 'userId', select: 'name' }
        })
        .sort({ collectionDate: -1 })
        .limit(5);

      return res.json({
        success: true,
        role: 'ADMIN',
        kpis: {
          totalDonors,
          totalHospitals,
          availableBloodUnits: stockSummary.totalAvailableUnits,
          pendingRequests,
          emergencyRequests,
          expiringSoon,
          lowStockCount: lowStockGroups.length
        },
        inventoryOverview: stockSummary.byBloodGroup,
        lowStockGroups,
        recentRequests,
        recentDonations
      });
    } else if (role === ROLES.HOSPITAL) {
      const hospitalProfile = await Hospital.findOne({ userId: req.user._id });
      if (!hospitalProfile) {
        return res.status(404).json({ success: false, message: 'Hospital profile not found' });
      }

      const totalSubmitted = await BloodRequest.countDocuments({ hospitalId: hospitalProfile._id });
      const pendingCount = await BloodRequest.countDocuments({ hospitalId: hospitalProfile._id, status: REQUEST_STATUS.PENDING });
      const approvedCount = await BloodRequest.countDocuments({ hospitalId: hospitalProfile._id, status: REQUEST_STATUS.APPROVED });
      const fulfilledCount = await BloodRequest.countDocuments({ hospitalId: hospitalProfile._id, status: REQUEST_STATUS.FULFILLED });
      const emergencyCount = await BloodRequest.countDocuments({ hospitalId: hospitalProfile._id, urgency: 'EMERGENCY' });

      const stockSummary = await getDynamicStockSummary();
      const recentRequests = await BloodRequest.find({ hospitalId: hospitalProfile._id })
        .sort({ createdAt: -1 })
        .limit(5);

      return res.json({
        success: true,
        role: 'HOSPITAL',
        hospitalProfile,
        kpis: {
          totalSubmitted,
          pendingCount,
          approvedCount,
          fulfilledCount,
          emergencyCount
        },
        availableStock: stockSummary.byBloodGroup,
        recentRequests
      });
    } else if (role === ROLES.DONOR) {
      const donorProfile = await Donor.findOne({ userId: req.user._id });
      if (!donorProfile) {
        return res.status(404).json({ success: false, message: 'Donor profile not found' });
      }

      const donations = await Donation.find({ donorId: donorProfile._id })
        .populate('bloodUnitRef')
        .sort({ createdAt: -1 });

      const activeStatuses = ['DONATION_REQUESTED', 'SCHEDULED', 'CHECK_IN', 'SCREENING', 'APPROVED', 'DONATED', 'TESTING'];
      const activeDonation = await Donation.findOne({ donorId: donorProfile._id, status: { $in: activeStatuses } }).sort({ createdAt: -1 });
      const completedCount = await Donation.countDocuments({ donorId: donorProfile._id, status: 'AVAILABLE' });
      const pendingCount = await Donation.countDocuments({ donorId: donorProfile._id, status: { $in: activeStatuses } });

      return res.json({
        success: true,
        role: 'DONOR',
        donorProfile,
        kpis: {
          bloodGroup: donorProfile.bloodGroup,
          totalDonations: Math.max(donorProfile.totalDonations || 0, completedCount),
          lastDonationDate: donorProfile.lastDonationDate,
          eligibilityStatus: donorProfile.eligibilityStatus,
          completedCount,
          pendingCount
        },
        activeDonation,
        donations,
        donationHistory: donations
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};
