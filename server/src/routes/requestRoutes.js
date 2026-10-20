const express = require('express');
const {
  getRequests,
  getRequestById,
  getRequestMatches,
  createBloodRequest,
  approveRequest,
  rejectRequest,
  fulfillRequest,
  cancelRequest
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getRequests)
  .post(authorize('HOSPITAL'), createBloodRequest);

router.get('/:id/matches', getRequestMatches);

router.route('/:id')
  .get(getRequestById);

router.patch('/:id/approve', authorize('ADMIN', 'HOSPITAL'), approveRequest);
router.patch('/:id/reject', authorize('ADMIN', 'HOSPITAL'), rejectRequest);
router.patch('/:id/fulfill', authorize('ADMIN', 'HOSPITAL'), fulfillRequest);
router.patch('/:id/cancel', authorize('ADMIN', 'HOSPITAL'), cancelRequest);

module.exports = router;
