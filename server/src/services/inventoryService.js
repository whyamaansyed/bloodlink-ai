const BloodInventory = require('../models/BloodInventory');
const BloodUnitTransaction = require('../models/BloodUnitTransaction');
const StockThreshold = require('../models/StockThreshold');
const { INVENTORY_STATUS, BLOOD_GROUPS, BLOOD_COMPONENTS } = require('../config/constants');
const { notifyAdmins } = require('./notificationService');

/**
 * Calculates current AVAILABLE non-expired stock dynamically grouped by blood group and component.
 */
const getDynamicStockSummary = async () => {
  const now = new Date();

  const aggregation = await BloodInventory.aggregate([
    {
      $match: {
        status: INVENTORY_STATUS.AVAILABLE,
        expiryDate: { $gt: now }
      }
    },
    {
      $group: {
        _id: { bloodGroup: '$bloodGroup', component: '$component' },
        totalUnits: { $sum: '$quantity' }
      }
    }
  ]);

  const stockMap = {};
  aggregation.forEach(item => {
    const key = `${item._id.bloodGroup}_${item._id.component}`;
    stockMap[key] = item.totalUnits;
  });

  const byBloodGroup = {};
  BLOOD_GROUPS.forEach(bg => { byBloodGroup[bg] = 0; });
  aggregation.forEach(item => {
    byBloodGroup[item._id.bloodGroup] = (byBloodGroup[item._id.bloodGroup] || 0) + item.totalUnits;
  });

  const byComponent = {};
  BLOOD_COMPONENTS.forEach(comp => { byComponent[comp] = 0; });
  aggregation.forEach(item => {
    byComponent[item._id.component] = (byComponent[item._id.component] || 0) + item.totalUnits;
  });

  const thresholds = await StockThreshold.find();
  const thresholdMap = {};
  thresholds.forEach(t => {
    thresholdMap[`${t.bloodGroup}_${t.component}`] = {
      minimumStock: t.minimumStock,
      criticalStock: t.criticalStock
    };
  });

  const detailedMatrix = [];
  let totalAvailableUnits = 0;

  for (const bg of BLOOD_GROUPS) {
    for (const comp of BLOOD_COMPONENTS) {
      const key = `${bg}_${comp}`;
      const currentStock = stockMap[key] || 0;
      totalAvailableUnits += currentStock;

      const thresh = thresholdMap[key] || { minimumStock: 10, criticalStock: 5 };
      let status = 'ADEQUATE';
      if (currentStock <= thresh.criticalStock) {
        status = 'CRITICAL';
      } else if (currentStock < thresh.minimumStock) {
        status = 'LOW STOCK';
      }

      detailedMatrix.push({
        bloodGroup: bg,
        component: comp,
        currentStock,
        minimumStock: thresh.minimumStock,
        criticalStock: thresh.criticalStock,
        status
      });
    }
  }

  return {
    totalAvailableUnits,
    byBloodGroup,
    byComponent,
    detailedMatrix
  };
};

/**
 * Checks stock levels after a fulfillment or inventory edit and triggers low stock alerts if needed.
 */
const checkStockThresholdsAndAlert = async (bloodGroup, component) => {
  const now = new Date();
  const availableUnits = await BloodInventory.aggregate([
    {
      $match: {
        bloodGroup,
        component,
        status: INVENTORY_STATUS.AVAILABLE,
        expiryDate: { $gt: now }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$quantity' }
      }
    }
  ]);

  const currentStock = availableUnits.length > 0 ? availableUnits[0].total : 0;
  const threshold = await StockThreshold.findOne({ bloodGroup, component }) || {
    minimumStock: 10,
    criticalStock: 5
  };

  if (currentStock <= threshold.criticalStock) {
    await notifyAdmins({
      type: 'LOW_STOCK',
      title: `CRITICAL STOCK ALERT: ${bloodGroup} (${component})`,
      message: `Stock level for ${bloodGroup} ${component} has dropped to CRITICAL level (${currentStock} units available, critical threshold is ${threshold.criticalStock}).`
    });
  } else if (currentStock < threshold.minimumStock) {
    await notifyAdmins({
      type: 'LOW_STOCK',
      title: `Low Stock Warning: ${bloodGroup} (${component})`,
      message: `Stock level for ${bloodGroup} ${component} is low (${currentStock} units available, minimum threshold is ${threshold.minimumStock}).`
    });
  }

  return { currentStock, threshold };
};

/**
 * FEFO (First Expiring First Out) inventory allocation strategy for fulfillment.
 */
const allocateBloodUnitsFEFO = async (bloodGroup, component, requiredQuantity, performedBy = null, relatedRequestId = null) => {
  const now = new Date();

  const availableUnits = await BloodInventory.find({
    bloodGroup,
    component,
    status: INVENTORY_STATUS.AVAILABLE,
    expiryDate: { $gt: now }
  }).sort({ expiryDate: 1 });

  let totalAvailableQuantity = availableUnits.reduce((acc, u) => acc + u.quantity, 0);

  if (totalAvailableQuantity < requiredQuantity) {
    throw new Error(
      `Insufficient available blood stock. Required: ${requiredQuantity} units, Available: ${totalAvailableQuantity} units.`
    );
  }

  let remainingToFulfill = requiredQuantity;
  const allocatedUnitIds = [];

  for (const unit of availableUnits) {
    if (remainingToFulfill <= 0) break;

    const issuedQuantity = Math.min(unit.quantity, remainingToFulfill);
    const prevStatus = unit.status;
    if (issuedQuantity === unit.quantity) {
      unit.status = INVENTORY_STATUS.ISSUED;
    } else {
      unit.quantity -= issuedQuantity;
    }
    await unit.save();
    allocatedUnitIds.push(unit._id);

    await BloodUnitTransaction.create({
      unitId: unit.unitId,
      inventoryRef: unit._id,
      action: 'ISSUED',
      statusFrom: prevStatus,
      statusTo: unit.status,
      quantity: issuedQuantity,
      performedBy,
      relatedRequest: relatedRequestId,
      notes: `FEFO allocation: ${issuedQuantity} unit(s) issued for hospital request fulfillment`
    });

    remainingToFulfill -= issuedQuantity;
  }

  return allocatedUnitIds;
};

module.exports = {
  getDynamicStockSummary,
  checkStockThresholdsAndAlert,
  allocateBloodUnitsFEFO
};
