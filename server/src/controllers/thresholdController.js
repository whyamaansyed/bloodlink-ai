const StockThreshold = require('../models/StockThreshold');
const { BLOOD_GROUPS, BLOOD_COMPONENTS } = require('../config/constants');
const { getDynamicStockSummary } = require('../services/inventoryService');

// @desc    Get all stock threshold configurations
// @route   GET /api/thresholds
// @access  Private (Admin)
const getThresholds = async (req, res, next) => {
  try {
    let thresholds = await StockThreshold.find().populate('updatedBy', 'name email');

    // Ensure thresholds exist for all 8 blood groups x 4 components
    if (thresholds.length < BLOOD_GROUPS.length * BLOOD_COMPONENTS.length) {
      for (const bg of BLOOD_GROUPS) {
        for (const comp of BLOOD_COMPONENTS) {
          const exists = thresholds.some(t => t.bloodGroup === bg && t.component === comp);
          if (!exists) {
            await StockThreshold.create({
              bloodGroup: bg,
              component: comp,
              minimumStock: 10,
              criticalStock: 5,
              updatedBy: req.user._id
            });
          }
        }
      }
      thresholds = await StockThreshold.find().populate('updatedBy', 'name email');
    }

    res.json({
      success: true,
      count: thresholds.length,
      thresholds
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock threshold for a blood group/component
// @route   PUT /api/thresholds/:id
// @access  Private (Admin)
const updateThreshold = async (req, res, next) => {
  try {
    const { minimumStock, criticalStock } = req.body;

    if (minimumStock < 0 || criticalStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock threshold levels must be non-negative' });
    }

    if (criticalStock > minimumStock) {
      return res.status(400).json({ success: false, message: 'Critical stock cannot exceed minimum stock threshold' });
    }

    const threshold = await StockThreshold.findByIdAndUpdate(
      req.params.id,
      {
        minimumStock,
        criticalStock,
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    );

    if (!threshold) {
      return res.status(404).json({ success: false, message: 'Threshold settings not found' });
    }

    res.json({
      success: true,
      threshold
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getThresholds,
  updateThreshold
};
