const BloodInventory = require('../models/BloodInventory');
const { INVENTORY_STATUS } = require('../config/constants');
const { getExpiryCategory, calculateDaysUntilExpiry } = require('./expiryService');

// Medically reviewed RBC & Plasma compatibility lookup
const RBC_COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

const PLASMA_COMPATIBILITY = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+']
};

const getCompatibleDonorGroups = (patientGroup, component) => {
  if (component === 'Plasma') {
    return PLASMA_COMPATIBILITY[patientGroup] || [patientGroup];
  }
  return RBC_COMPATIBILITY[patientGroup] || [patientGroup];
};

/**
 * Intelligent Matching Algorithm:
 * Evaluates request requirements against available inventory across exact & compatible blood groups.
 */
const findIntelligentMatches = async ({ bloodGroup, component, requiredQuantity, city = null }) => {
  const now = new Date();
  const compatibleGroups = getCompatibleDonorGroups(bloodGroup, component);

  // Query all eligible available non-expired units matching compatible blood groups
  const availableUnits = await BloodInventory.find({
    bloodGroup: { $in: compatibleGroups },
    component,
    status: INVENTORY_STATUS.AVAILABLE,
    expiryDate: { $gt: now }
  }).sort({ expiryDate: 1 }); // FEFO priority sorting

  // Calculate stock breakdown by compatible blood group
  const stockByGroup = {};
  compatibleGroups.forEach(bg => { stockByGroup[bg] = 0; });

  const exactMatchUnits = [];
  const compatibleMatchUnits = [];

  availableUnits.forEach(unit => {
    const daysRemaining = calculateDaysUntilExpiry(unit.expiryDate);
    const unitObj = {
      ...unit.toObject(),
      daysRemaining,
      expiryCategory: getExpiryCategory(daysRemaining),
      isExactMatch: unit.bloodGroup === bloodGroup
    };

    stockByGroup[unit.bloodGroup] = (stockByGroup[unit.bloodGroup] || 0) + unit.quantity;

    if (unit.bloodGroup === bloodGroup) {
      exactMatchUnits.push(unitObj);
    } else {
      compatibleMatchUnits.push(unitObj);
    }
  });

  const totalExactAvailable = stockByGroup[bloodGroup] || 0;
  const totalCompatibleAvailable = Object.values(stockByGroup).reduce((a, b) => a + b, 0);

  let matchStatus = 'EXACT_MATCH_AVAILABLE';
  if (totalExactAvailable >= requiredQuantity) {
    matchStatus = 'EXACT_MATCH_AVAILABLE';
  } else if (totalCompatibleAvailable >= requiredQuantity) {
    matchStatus = 'COMPATIBLE_MATCH_AVAILABLE';
  } else if (totalCompatibleAvailable > 0) {
    matchStatus = 'PARTIAL_MATCH_AVAILABLE';
  } else {
    matchStatus = 'SHORTAGE_ALERT';
  }

  return {
    requested: {
      bloodGroup,
      component,
      requiredQuantity
    },
    matchStatus,
    compatibleBloodGroups: compatibleGroups,
    stockSummary: {
      exactAvailable: totalExactAvailable,
      totalCompatibleAvailable,
      byGroup: stockByGroup
    },
    recommendedUnits: [...exactMatchUnits, ...compatibleMatchUnits].slice(0, requiredQuantity + 5),
    exactMatchCount: exactMatchUnits.length,
    compatibleMatchCount: compatibleMatchUnits.length
  };
};

module.exports = {
  getCompatibleDonorGroups,
  findIntelligentMatches
};
