const BloodInventory = require('../models/BloodInventory');
const { INVENTORY_STATUS } = require('../config/constants');
const { notifyAdmins } = require('./notificationService');

/**
 * Calculates days remaining until expiry date
 */
const calculateDaysUntilExpiry = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Gets expiry category based on days remaining
 */
const getExpiryCategory = (daysRemaining) => {
  if (daysRemaining <= 0) return 'EXPIRED';
  if (daysRemaining <= 3) return 'CRITICAL';
  if (daysRemaining <= 7) return 'WARNING';
  return 'NORMAL';
};

/**
 * Sweeps inventory database and automatically marks expired units as EXPIRED
 * and sends alerts for expiring units.
 */
const checkAndUpdateExpiringUnits = async () => {
  try {
    const now = new Date();

    // 1. Mark expired units
    const expiredResult = await BloodInventory.updateMany(
      {
        status: INVENTORY_STATUS.AVAILABLE,
        expiryDate: { $lte: now }
      },
      {
        $set: { status: INVENTORY_STATUS.EXPIRED }
      }
    );

    if (expiredResult.modifiedCount > 0) {
      await notifyAdmins({
        type: 'EXPIRY_WARNING',
        title: 'Blood Units Expired',
        message: `${expiredResult.modifiedCount} blood unit(s) reached expiry date and were set to EXPIRED status.`
      });
    }

    // 2. Identify units expiring in 1-7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const unitsExpiringSoon = await BloodInventory.find({
      status: INVENTORY_STATUS.AVAILABLE,
      expiryDate: { $gt: now, $lte: sevenDaysFromNow }
    });

    return {
      expiredCount: expiredResult.modifiedCount,
      expiringSoonCount: unitsExpiringSoon.length,
      expiringUnits: unitsExpiringSoon
    };
  } catch (error) {
    console.error('Error in checkAndUpdateExpiringUnits:', error.message);
    throw error;
  }
};

module.exports = {
  calculateDaysUntilExpiry,
  getExpiryCategory,
  checkAndUpdateExpiringUnits
};
