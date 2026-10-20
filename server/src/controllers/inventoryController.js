const BloodInventory = require('../models/BloodInventory');
const BloodUnitTransaction = require('../models/BloodUnitTransaction');
const Donor = require('../models/Donor');
const { getDynamicStockSummary, checkStockThresholdsAndAlert } = require('../services/inventoryService');
const { calculateDaysUntilExpiry, getExpiryCategory, checkAndUpdateExpiringUnits } = require('../services/expiryService');
const { INVENTORY_STATUS } = require('../config/constants');

// @desc    Get all inventory units with filters & search
// @route   GET /api/inventory
// @access  Private
const getInventory = async (req, res, next) => {
  try {
    const { bloodGroup, component, status, search } = req.query;
    const query = {};

    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (component) query.component = component;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { unitId: { $regex: search, $options: 'i' } },
        { storageLocation: { $regex: search, $options: 'i' } }
      ];
    }

    let units = await BloodInventory.find(query)
      .populate({
        path: 'donorId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ expiryDate: 1 });

    const unitsWithExpiryMeta = units.map(unit => {
      const daysRemaining = calculateDaysUntilExpiry(unit.expiryDate);
      const category = getExpiryCategory(daysRemaining);
      return {
        ...unit.toObject(),
        daysRemaining,
        expiryCategory: category
      };
    });

    res.json({
      success: true,
      count: unitsWithExpiryMeta.length,
      inventory: unitsWithExpiryMeta
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single unit by ID with movement transaction history
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryById = async (req, res, next) => {
  try {
    const unit = await BloodInventory.findById(req.params.id).populate('donorId');
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Blood unit not found' });
    }

    const daysRemaining = calculateDaysUntilExpiry(unit.expiryDate);
    const category = getExpiryCategory(daysRemaining);

    // Fetch transaction audit trail
    const history = await BloodUnitTransaction.find({ inventoryRef: unit._id })
      .populate('performedBy', 'name email role')
      .populate('relatedRequest')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      unit: {
        ...unit.toObject(),
        daysRemaining,
        expiryCategory: category
      },
      history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction movement log for a unit
// @route   GET /api/inventory/:id/history
// @access  Private
const getUnitHistory = async (req, res, next) => {
  try {
    const history = await BloodUnitTransaction.find({ inventoryRef: req.params.id })
      .populate('performedBy', 'name email role')
      .populate({ path: 'relatedRequest', populate: { path: 'hospitalId', select: 'hospitalName' } })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new blood unit
// @route   POST /api/inventory
// @access  Private (Admin)
const addBloodUnit = async (req, res, next) => {
  try {
    const { bloodGroup, component, quantity, collectionDate, expiryDate, donorId, storageLocation } = req.body;

    if (new Date(expiryDate) <= new Date(collectionDate)) {
      return res.status(400).json({ success: false, message: 'Expiry date must be logically later than collection date' });
    }

    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const unitId = `BLD-${datePrefix}-${randomSuffix}`;

    const unit = await BloodInventory.create({
      unitId,
      bloodGroup,
      component,
      quantity: quantity || 1,
      collectionDate,
      expiryDate,
      donorId: donorId || null,
      storageLocation: storageLocation || 'Main Storage - Freezer A',
      status: INVENTORY_STATUS.AVAILABLE
    });

    if (donorId) {
      await Donor.findByIdAndUpdate(donorId, {
        $inc: { totalDonations: 1 },
        $set: { lastDonationDate: collectionDate }
      });
    }

    // Log transaction movement
    await BloodUnitTransaction.create({
      unitId: unit.unitId,
      inventoryRef: unit._id,
      action: 'DONATED',
      statusFrom: null,
      statusTo: INVENTORY_STATUS.AVAILABLE,
      performedBy: req.user._id,
      notes: `Blood unit donated & registered into ${storageLocation}`
    });

    await checkStockThresholdsAndAlert(bloodGroup, component);

    res.status(201).json({
      success: true,
      unit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blood unit status or details
// @route   PUT /api/inventory/:id
// @access  Private (Admin)
const updateBloodUnit = async (req, res, next) => {
  try {
    let unit = await BloodInventory.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Blood unit not found' });
    }

    const oldStatus = unit.status;
    unit = await BloodInventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (oldStatus !== unit.status) {
      await BloodUnitTransaction.create({
        unitId: unit.unitId,
        inventoryRef: unit._id,
        action: 'STATUS_CHANGE',
        statusFrom: oldStatus,
        statusTo: unit.status,
        performedBy: req.user._id,
        notes: `Status manually updated from ${oldStatus} to ${unit.status}`
      });
    }

    await checkStockThresholdsAndAlert(unit.bloodGroup, unit.component);

    res.json({
      success: true,
      unit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blood unit
// @route   DELETE /api/inventory/:id
// @access  Private (Admin)
const deleteBloodUnit = async (req, res, next) => {
  try {
    const unit = await BloodInventory.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Blood unit not found' });
    }

    await BloodInventory.findByIdAndDelete(req.params.id);
    await checkStockThresholdsAndAlert(unit.bloodGroup, unit.component);

    res.json({
      success: true,
      message: 'Blood unit deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic summary of current stock
// @route   GET /api/inventory/summary
// @access  Private
const getInventorySummary = async (req, res, next) => {
  try {
    const summary = await getDynamicStockSummary();
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStockAlerts = async (req, res, next) => {
  try {
    const summary = await getDynamicStockSummary();
    const lowStockItems = summary.detailedMatrix.filter(item => item.status === 'LOW STOCK' || item.status === 'CRITICAL');

    res.json({
      success: true,
      count: lowStockItems.length,
      alerts: lowStockItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expiring blood units
// @route   GET /api/inventory/expiring
// @access  Private
const getExpiringUnits = async (req, res, next) => {
  try {
    await checkAndUpdateExpiringUnits();

    const units = await BloodInventory.find({
      status: INVENTORY_STATUS.AVAILABLE
    }).sort({ expiryDate: 1 });

    const expiringUnits = units
      .map(u => {
        const daysRemaining = calculateDaysUntilExpiry(u.expiryDate);
        const category = getExpiryCategory(daysRemaining);
        return {
          ...u.toObject(),
          daysRemaining,
          expiryCategory: category
        };
      })
      .filter(u => u.daysRemaining <= 7);

    res.json({
      success: true,
      count: expiringUnits.length,
      expiringUnits
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  getInventoryById,
  getUnitHistory,
  addBloodUnit,
  updateBloodUnit,
  deleteBloodUnit,
  getInventorySummary,
  getLowStockAlerts,
  getExpiringUnits
};
