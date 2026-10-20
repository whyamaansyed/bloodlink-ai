const DemandRecord = require('../models/DemandRecord');
const BloodRequest = require('../models/BloodRequest');
const { BLOOD_GROUPS, BLOOD_COMPONENTS, REQUEST_STATUS } = require('../config/constants');
const { getDynamicStockSummary } = require('./inventoryService');

/**
 * Record demand events into aggregated database records.
 */
const recordDemandEvent = async ({ bloodGroup, component, date = new Date(), requested = 0, fulfilled = 0, rejected = 0, emergency = 0 }) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  let record = await DemandRecord.findOne({
    bloodGroup,
    component,
    date: startOfDay
  });

  if (record) {
    record.requestedUnits += requested;
    record.fulfilledUnits += fulfilled;
    record.rejectedUnits += rejected;
    record.emergencyRequests += emergency;
    await record.save();
  } else {
    record = await DemandRecord.create({
      bloodGroup,
      component,
      date: startOfDay,
      requestedUnits: requested,
      fulfilledUnits: fulfilled,
      rejectedUnits: rejected,
      emergencyRequests: emergency
    });
  }

  return record;
};

/**
 * Get comprehensive demand analytics summary from actual DB records.
 */
const getDemandAnalytics = async ({ startDate, endDate, bloodGroup, component } = {}) => {
  const query = {};

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (bloodGroup) query.bloodGroup = bloodGroup;
  if (component) query.component = component;

  // Request-level metrics
  const requestQuery = {};
  if (bloodGroup) requestQuery.bloodGroup = bloodGroup;
  if (component) requestQuery.component = component;

  const totalRequestsCount = await BloodRequest.countDocuments(requestQuery);
  const fulfilledRequestsCount = await BloodRequest.countDocuments({ ...requestQuery, status: REQUEST_STATUS.FULFILLED });
  const rejectedRequestsCount = await BloodRequest.countDocuments({ ...requestQuery, status: REQUEST_STATUS.REJECTED });
  const pendingRequestsCount = await BloodRequest.countDocuments({ ...requestQuery, status: REQUEST_STATUS.PENDING });
  const emergencyRequestsCount = await BloodRequest.countDocuments({ ...requestQuery, urgency: 'EMERGENCY' });

  const fulfillmentRate = totalRequestsCount > 0
    ? ((fulfilledRequestsCount / totalRequestsCount) * 100).toFixed(1)
    : 0;

  // Historical demand records aggregation by month
  const monthlyTrends = await DemandRecord.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        requested: { $sum: '$requestedUnits' },
        fulfilled: { $sum: '$fulfilledUnits' },
        rejected: { $sum: '$rejectedUnits' },
        emergency: { $sum: '$emergencyRequests' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonthlyTrends = monthlyTrends.map(item => ({
    month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    requested: item.requested,
    fulfilled: item.fulfilled,
    rejected: item.rejected,
    emergency: item.emergency
  }));

  // Demand by Blood Group
  const demandByBloodGroup = await DemandRecord.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$bloodGroup',
        requested: { $sum: '$requestedUnits' },
        fulfilled: { $sum: '$fulfilledUnits' }
      }
    }
  ]);

  const bloodGroupChartData = BLOOD_GROUPS.map(bg => {
    const found = demandByBloodGroup.find(d => d._id === bg);
    return {
      bloodGroup: bg,
      requested: found ? found.requested : 0,
      fulfilled: found ? found.fulfilled : 0
    };
  });

  // Demand by Component
  const demandByComponent = await DemandRecord.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$component',
        requested: { $sum: '$requestedUnits' },
        fulfilled: { $sum: '$fulfilledUnits' }
      }
    }
  ]);

  const componentChartData = BLOOD_COMPONENTS.map(comp => {
    const found = demandByComponent.find(c => c._id === comp);
    return {
      component: comp,
      requested: found ? found.requested : 0,
      fulfilled: found ? found.fulfilled : 0
    };
  });

  // Current Stock vs Average Demand comparison
  const stockSummary = await getDynamicStockSummary();
  const stockVsDemand = BLOOD_GROUPS.map(bg => {
    const bgDemand = bloodGroupChartData.find(d => d.bloodGroup === bg);
    const avgDemand = bgDemand ? Math.round(bgDemand.requested / 3) : 0; // 3-month average
    const currentStock = stockSummary.byBloodGroup[bg] || 0;
    return {
      bloodGroup: bg,
      currentStock,
      avgMonthlyDemand: avgDemand,
      gap: currentStock - avgDemand
    };
  });

  return {
    summary: {
      totalRequests: totalRequestsCount,
      fulfilledRequests: fulfilledRequestsCount,
      rejectedRequests: rejectedRequestsCount,
      pendingRequests: pendingRequestsCount,
      emergencyRequests: emergencyRequestsCount,
      fulfillmentRate: `${fulfillmentRate}%`
    },
    monthlyTrends: formattedMonthlyTrends,
    bloodGroupDemand: bloodGroupChartData,
    componentDemand: componentChartData,
    stockVsDemand
  };
};

/**
 * Transparent Demand Estimation using Moving Average and Weighted Moving Average algorithms.
 */
const getDemandEstimation = async () => {
  const records = await DemandRecord.find().sort({ date: 1 });

  if (!records || records.length === 0) {
    return {
      hasData: false,
      message: 'Insufficient historical data for reliable estimation.'
    };
  }

  // Group by blood group
  const bloodGroupEstimates = [];

  for (const bg of BLOOD_GROUPS) {
    const bgRecords = await DemandRecord.aggregate([
      { $match: { bloodGroup: bg } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalRequested: { $sum: '$requestedUnits' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 3 }
    ]);

    if (bgRecords.length === 0) {
      bloodGroupEstimates.push({
        bloodGroup: bg,
        historicalAverage: 0,
        estimatedNextPeriod: 0,
        confidence: 'Low (Insufficient Data)'
      });
      continue;
    }

    const monthsData = bgRecords.map(r => r.totalRequested);
    const sum = monthsData.reduce((a, b) => a + b, 0);
    const historicalAverage = Math.round(sum / monthsData.length);

    // Weighted Moving Average (giving recent month higher weight: 50%, 30%, 20%)
    let weightedEstimate = historicalAverage;
    if (monthsData.length === 3) {
      weightedEstimate = Math.round(monthsData[0] * 0.5 + monthsData[1] * 0.3 + monthsData[2] * 0.2);
    } else if (monthsData.length === 2) {
      weightedEstimate = Math.round(monthsData[0] * 0.6 + monthsData[1] * 0.4);
    }

    bloodGroupEstimates.push({
      bloodGroup: bg,
      historicalAverage,
      estimatedNextPeriod: weightedEstimate,
      sampleMonthsCount: monthsData.length,
      confidence: monthsData.length >= 3 ? 'High' : 'Moderate'
    });
  }

  return {
    hasData: true,
    methodology: {
      name: 'Weighted Moving Average (WMA)',
      description: 'Calculated using a 3-month historical window with weights 0.5 (M-1), 0.3 (M-2), and 0.2 (M-3).',
      disclaimer: 'This estimation is a statistical inventory planning heuristic based on historical demand records. It is intended strictly for administrative supply chain decision support and is NOT clinically predictive or medically binding.'
    },
    estimates: bloodGroupEstimates
  };
};

module.exports = {
  recordDemandEvent,
  getDemandAnalytics,
  getDemandEstimation
};
