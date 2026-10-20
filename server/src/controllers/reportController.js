const BloodInventory = require('../models/BloodInventory');
const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const DemandRecord = require('../models/DemandRecord');
const { getDynamicStockSummary } = require('../services/inventoryService');
const { calculateDaysUntilExpiry, getExpiryCategory } = require('../services/expiryService');

// @desc    Generate reports based on report type and date range filters
// @route   GET /api/reports/:type
// @access  Private (Admin)
const getReportData = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, bloodGroup, component } = req.query;

    let reportTitle = '';
    let reportData = [];

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.$gte = startDate ? new Date(startDate) : new Date(0);
      dateFilter.$lte = endDate ? new Date(endDate) : new Date();
    }

    if (type === 'inventory') {
      reportTitle = 'Current Blood Inventory Report';
      const query = {};
      if (startDate || endDate) query.createdAt = dateFilter;
      if (bloodGroup) query.bloodGroup = bloodGroup;
      if (component) query.component = component;

      reportData = await BloodInventory.find(query)
        .populate({ path: 'donorId', populate: { path: 'userId', select: 'name' } })
        .sort({ expiryDate: 1 });

      reportData = reportData.map(u => ({
        unitId: u.unitId,
        bloodGroup: u.bloodGroup,
        component: u.component,
        quantity: u.quantity,
        collectionDate: u.collectionDate,
        expiryDate: u.expiryDate,
        storageLocation: u.storageLocation,
        status: u.status,
        donorName: u.donorId && u.donorId.userId ? u.donorId.userId.name : 'N/A'
      }));
    } else if (type === 'donations') {
      reportTitle = 'Blood Donation Report';
      const query = { donorId: { $ne: null } };
      if (startDate || endDate) query.collectionDate = dateFilter;
      if (bloodGroup) query.bloodGroup = bloodGroup;

      const donations = await BloodInventory.find(query)
        .populate({ path: 'donorId', populate: { path: 'userId', select: 'name email phone' } })
        .sort({ collectionDate: -1 });

      reportData = donations.map(d => ({
        unitId: d.unitId,
        donorName: d.donorId && d.donorId.userId ? d.donorId.userId.name : 'Unknown',
        bloodGroup: d.bloodGroup,
        component: d.component,
        quantity: d.quantity,
        collectionDate: d.collectionDate,
        storageLocation: d.storageLocation
      }));
    } else if (type === 'requests') {
      reportTitle = 'Hospital Blood Requests Report';
      const query = {};
      if (startDate || endDate) query.createdAt = dateFilter;
      if (bloodGroup) query.bloodGroup = bloodGroup;
      if (component) query.component = component;

      const requests = await BloodRequest.find(query)
        .populate('hospitalId', 'hospitalName city')
        .sort({ createdAt: -1 });

      reportData = requests.map(r => ({
        requestId: r._id,
        hospitalName: r.hospitalId ? r.hospitalId.hospitalName : 'N/A',
        patientReference: r.patientReference,
        bloodGroup: r.bloodGroup,
        component: r.component,
        quantity: r.quantity,
        urgency: r.urgency,
        status: r.status,
        createdAt: r.createdAt
      }));
    } else if (type === 'demand') {
      reportTitle = 'Blood Demand & Consumption Report';
      const query = {};
      if (startDate || endDate) query.date = dateFilter;
      if (bloodGroup) query.bloodGroup = bloodGroup;

      reportData = await DemandRecord.find(query).sort({ date: -1 });
    } else if (type === 'expiry') {
      reportTitle = 'Blood Expiry Risk Report';
      const units = await BloodInventory.find({ status: { $in: ['AVAILABLE', 'EXPIRED'] } }).sort({ expiryDate: 1 });
      reportData = units
        .map(u => {
          const daysRemaining = calculateDaysUntilExpiry(u.expiryDate);
          return {
            unitId: u.unitId,
            bloodGroup: u.bloodGroup,
            component: u.component,
            quantity: u.quantity,
            expiryDate: u.expiryDate,
            daysRemaining,
            category: getExpiryCategory(daysRemaining),
            status: u.status
          };
        })
        .filter(u => u.daysRemaining <= 10 || u.status === 'EXPIRED');
    } else if (type === 'low-stock') {
      reportTitle = 'Low Stock & Replenishment Report';
      const summary = await getDynamicStockSummary();
      reportData = summary.detailedMatrix.filter(m => m.status === 'LOW STOCK' || m.status === 'CRITICAL');
    } else {
      return res.status(400).json({ success: false, message: 'Invalid report type requested' });
    }

    res.json({
      success: true,
      reportTitle,
      generatedAt: new Date(),
      count: reportData.length,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportData
};
