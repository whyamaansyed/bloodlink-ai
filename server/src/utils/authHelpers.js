const Hospital = require('../models/Hospital');
const { ROLES } = require('../config/constants');

/**
 * Resolves the Hospital document associated with the authenticated user
 * using the existing database relationship (Hospital.userId -> User._id).
 * 
 * @param {Object} req - Express request object containing req.user
 * @returns {Promise<Object|null>} Hospital document or null
 */
const getAuthenticatedHospital = async (req) => {
  if (!req.user) return null;
  if (req.user.role === ROLES.HOSPITAL) {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    return hospital;
  }
  return null;
};

module.exports = {
  getAuthenticatedHospital
};
