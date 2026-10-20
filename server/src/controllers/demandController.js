const { getDemandAnalytics, getDemandEstimation, recordDemandEvent } = require('../services/demandService');

// @desc    Get demand analytics & trends
// @route   GET /api/demand/summary & /api/demand/trends & /api/demand
// @access  Private
const getDemandMetrics = async (req, res, next) => {
  try {
    const { startDate, endDate, bloodGroup, component } = req.query;
    const analytics = await getDemandAnalytics({ startDate, endDate, bloodGroup, component });
    res.json({
      success: true,
      ...analytics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get smart demand estimations (WMA algorithm)
// @route   GET /api/demand/estimate
// @access  Private
const getEstimations = async (req, res, next) => {
  try {
    const estimation = await getDemandEstimation();
    res.json({
      success: true,
      ...estimation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually post demand record
// @route   POST /api/demand
// @access  Private (Admin)
const createDemandRecord = async (req, res, next) => {
  try {
    const { bloodGroup, component, date, requestedUnits, fulfilledUnits, rejectedUnits, emergencyRequests } = req.body;
    const record = await recordDemandEvent({
      bloodGroup,
      component,
      date: date ? new Date(date) : new Date(),
      requested: requestedUnits || 0,
      fulfilled: fulfilledUnits || 0,
      rejected: rejectedUnits || 0,
      emergency: emergencyRequests || 0
    });

    res.status(201).json({
      success: true,
      record
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDemandMetrics,
  getEstimations,
  createDemandRecord
};
