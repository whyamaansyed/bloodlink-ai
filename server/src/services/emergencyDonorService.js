const Donor = require('../models/Donor');
const User = require('../models/User');
const { getCompatibleDonorGroups } = require('./matchingService');
const { createNotification } = require('./notificationService');

/**
 * Broadcast emergency notifications to eligible donors matching compatible blood groups.
 */
const notifyEmergencyDonors = async ({ bloodGroup, component, hospitalName, emergencyReason, requiredQuantity }) => {
  try {
    const compatibleGroups = getCompatibleDonorGroups(bloodGroup, component);

    // Find eligible donors matching compatible blood groups
    const eligibleDonors = await Donor.find({
      bloodGroup: { $in: compatibleGroups },
      eligibilityStatus: 'ELIGIBLE'
    }).populate('userId');

    let notifiedCount = 0;

    for (const donor of eligibleDonors) {
      if (donor.userId && donor.userId._id) {
        await createNotification({
          userId: donor.userId._id,
          type: 'SYSTEM',
          title: `🚨 URGENT BLOOD DONOR ALERT: ${bloodGroup} (${component})`,
          message: `EMERGENCY ALERT from ${hospitalName}: ${requiredQuantity} unit(s) of ${bloodGroup} (${component}) needed urgently! Reason: ${emergencyReason}. Please contact blood bank if eligible to donate.`,
          relatedId: donor._id.toString()
        });
        notifiedCount++;
      }
    }

    return {
      success: true,
      eligibleDonorsFound: eligibleDonors.length,
      notifiedCount,
      compatibleGroups
    };
  } catch (error) {
    console.error('Error notifying emergency donors:', error.message);
    throw error;
  }
};

module.exports = {
  notifyEmergencyDonors
};
