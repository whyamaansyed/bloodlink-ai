const BloodRequest = require('../models/BloodRequest');
const Hospital = require('../models/Hospital');
const { allocateBloodUnitsFEFO, checkStockThresholdsAndAlert } = require('../services/inventoryService');
const { recordDemandEvent } = require('../services/demandService');
const { createNotification, notifyAdmins } = require('../services/notificationService');
const { findIntelligentMatches } = require('../services/matchingService');
const { notifyEmergencyDonors } = require('../services/emergencyDonorService');
const { REQUEST_STATUS, ROLES } = require('../config/constants');
const { getAuthenticatedHospital } = require('../utils/authHelpers');

// Calculate priority score for queue ranking
const calculatePriorityScore = (urgency, createdAt) => {
  let urgencyWeight = 10;
  if (urgency === 'URGENT') urgencyWeight = 50;
  if (urgency === 'EMERGENCY') urgencyWeight = 100;

  const hoursPending = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60));
  return urgencyWeight + hoursPending * 2;
};

// @desc    Get all requests sorted by Priority Queue Score or Date (Server-side hospital isolation)
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res, next) => {
  try {
    const { status, urgency, bloodGroup, component, search, sortByPriority } = req.query;
    const query = {};

    if (req.user.role === ROLES.HOSPITAL) {
      const hospitalProfile = await getAuthenticatedHospital(req);
      if (!hospitalProfile) {
        return res.status(404).json({ success: false, message: 'Hospital profile not found for logged in user' });
      }
      query.hospitalId = hospitalProfile._id;
    }

    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (component) query.component = component;

    let requests = await BloodRequest.find(query)
      .populate('hospitalId', 'hospitalName registrationNumber phone email city')
      .populate('approvedBy', 'name email')
      .populate('fulfilledUnits')
      .sort({ createdAt: -1 });

    if (search) {
      const searchLower = search.toLowerCase();
      requests = requests.filter(r =>
        r.patientReference.toLowerCase().includes(searchLower) ||
        (r.hospitalId && r.hospitalId.hospitalName && r.hospitalId.hospitalName.toLowerCase().includes(searchLower))
      );
    }

    // Attach calculated priority scores & optionally sort by priority
    const requestsWithPriority = requests.map(r => ({
      ...r.toObject(),
      priorityScore: calculatePriorityScore(r.urgency, r.createdAt)
    }));

    if (sortByPriority === 'true') {
      requestsWithPriority.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    res.json({
      success: true,
      count: requestsWithPriority.length,
      requests: requestsWithPriority
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single blood request with hospital ownership check
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('hospitalId')
      .populate('approvedBy', 'name email')
      .populate('fulfilledUnits');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (req.user.role === ROLES.HOSPITAL) {
      const hospitalProfile = await getAuthenticatedHospital(req);
      if (!hospitalProfile || request.hospitalId?._id.toString() !== hospitalProfile._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to view this request' });
      }
    }

    res.json({ success: true, request });
  } catch (error) { next(error); }
};

// @desc    Get intelligent matches for a blood request
// @route   GET /api/requests/:id/matches
// @access  Private
const getRequestMatches = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate('hospitalId');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (req.user.role === ROLES.HOSPITAL) {
      const hospitalProfile = await getAuthenticatedHospital(req);
      if (!hospitalProfile || request.hospitalId?._id.toString() !== hospitalProfile._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this request' });
      }
    }

    const matches = await findIntelligentMatches({
      bloodGroup: request.bloodGroup,
      component: request.component,
      requiredQuantity: request.quantity,
      city: request.hospitalId ? request.hospitalId.city : null
    });

    res.json({
      success: true,
      request,
      matches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new blood request (Hospital)
// @route   POST /api/requests
// @access  Private (Hospital)
const createBloodRequest = async (req, res, next) => {
  try {
    const { patientReference, bloodGroup, component, quantity, urgency, requiredDate, reason } = req.body;

    const hospitalProfile = await getAuthenticatedHospital(req);
    if (!hospitalProfile) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found for logged in user' });
    }

    const bloodRequest = await BloodRequest.create({
      hospitalId: hospitalProfile._id,
      patientReference,
      bloodGroup,
      component,
      quantity,
      urgency: urgency || 'NORMAL',
      requiredDate,
      reason,
      status: REQUEST_STATUS.PENDING
    });

    await recordDemandEvent({
      bloodGroup,
      component,
      requested: quantity,
      emergency: urgency === 'EMERGENCY' ? 1 : 0
    });

    await notifyAdmins({
      type: 'REQUEST_CREATED',
      title: `${urgency === 'EMERGENCY' ? '🚨 EMERGENCY' : 'New'} Request from ${hospitalProfile.hospitalName}`,
      message: `${hospitalProfile.hospitalName} requested ${quantity} unit(s) of ${bloodGroup} (${component}). Urgency: ${urgency}`,
      relatedId: bloodRequest._id.toString()
    });

    let emergencyBroadcast = null;
    if (urgency === 'EMERGENCY') {
      emergencyBroadcast = await notifyEmergencyDonors({
        bloodGroup,
        component,
        hospitalName: hospitalProfile.hospitalName,
        emergencyReason: reason,
        requiredQuantity: quantity
      });
    }

    res.status(201).json({
      success: true,
      request: bloodRequest,
      emergencyBroadcast
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve blood request
// @route   PATCH /api/requests/:id/approve
// @access  Private (Admin, Hospital)
const approveRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate('hospitalId');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (req.user.role === ROLES.HOSPITAL) {
      const hospitalProfile = await getAuthenticatedHospital(req);
      if (!hospitalProfile || request.hospitalId?._id.toString() !== hospitalProfile._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to approve this request' });
      }
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: `Cannot approve request with status '${request.status}'` });
    }

    request.status = REQUEST_STATUS.APPROVED;
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    await request.save();

    if (request.hospitalId && request.hospitalId.userId) {
      await createNotification({
        userId: request.hospitalId.userId,
        type: 'REQUEST_APPROVED',
        title: 'Blood Request Approved',
        message: `Your request for ${request.quantity} unit(s) of ${request.bloodGroup} (${request.component}) has been approved.`,
        relatedId: request._id.toString()
      });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject blood request
// @route   PATCH /api/requests/:id/reject
// @access  Private (Admin, Hospital)
const rejectRequest = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const request = await BloodRequest.findById(req.params.id).populate('hospitalId');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (req.user.role === ROLES.HOSPITAL) {
      const hospitalProfile = await getAuthenticatedHospital(req);
      if (!hospitalProfile || request.hospitalId?._id.toString() !== hospitalProfile._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to reject this request' });
      }
    }

    if (request.status === REQUEST_STATUS.FULFILLED || request.status === REQUEST_STATUS.CANCELLED) {
      return res.status(400).json({ success: false, message: `Cannot reject request with status '${request.status}'` });
    }

    request.status = REQUEST_STATUS.REJECTED;
    request.rejectionReason = rejectionReason;
    await request.save();

    await recordDemandEvent({
      bloodGroup: request.bloodGroup,
      component: request.component,
      rejected: request.quantity
    });

    if (request.hospitalId && request.hospitalId.userId) {
      await createNotification({
        userId: request.hospitalId.userId,
        type: 'REQUEST_REJECTED',
        title: 'Blood Request Rejected',
        message: `Your request for ${request.quantity} unit(s) of ${request.bloodGroup} was rejected. Reason: ${rejectionReason}`,
        relatedId: request._id.toString()
      });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fulfill blood request
// @route   PATCH /api/requests/:id/fulfill
// @access  Private (Admin, Hospital)
const fulfillRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate('hospitalId');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (req.user.role === ROLES.HOSPITAL) {
      const hospitalProfile = await getAuthenticatedHospital(req);
      if (!hospitalProfile || request.hospitalId?._id.toString() !== hospitalProfile._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to fulfill this request' });
      }
    }

    if (request.status !== REQUEST_STATUS.APPROVED && request.status !== REQUEST_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: `Cannot fulfill request with status '${request.status}'` });
    }

    const allocatedUnitIds = await allocateBloodUnitsFEFO(
      request.bloodGroup,
      request.component,
      request.quantity,
      req.user._id,
      request._id
    );

    request.status = REQUEST_STATUS.FULFILLED;
    request.fulfilledAt = new Date();
    request.fulfilledUnits = allocatedUnitIds;
    if (!request.approvedBy) request.approvedBy = req.user._id;
    if (!request.approvedAt) request.approvedAt = new Date();
    await request.save();

    await recordDemandEvent({
      bloodGroup: request.bloodGroup,
      component: request.component,
      fulfilled: request.quantity
    });

    await checkStockThresholdsAndAlert(request.bloodGroup, request.component);

    if (request.hospitalId && request.hospitalId.userId) {
      await createNotification({
        userId: request.hospitalId.userId,
        type: 'REQUEST_FULFILLED',
        title: 'Blood Request Fulfilled! 🩸',
        message: `Your request for ${request.quantity} unit(s) of ${request.bloodGroup} (${request.component}) has been fulfilled and dispatched.`,
        relatedId: request._id.toString()
      });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel request (Hospital)
// @route   PATCH /api/requests/:id/cancel
// @access  Private (Hospital)
const cancelRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (req.user.role === ROLES.HOSPITAL) {
      const hospitalProfile = await getAuthenticatedHospital(req);
      if (!hospitalProfile || request.hospitalId?.toString() !== hospitalProfile._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to cancel this request' });
      }
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: `Cannot cancel request once it is ${request.status}` });
    }

    request.status = REQUEST_STATUS.CANCELLED;
    await request.save();

    res.json({
      success: true,
      request
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests,
  getRequestById,
  getRequestMatches,
  createBloodRequest,
  approveRequest,
  rejectRequest,
  fulfillRequest,
  cancelRequest
};
