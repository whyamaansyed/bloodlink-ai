const express = require('express');
const {
  createDonation,
  getMyDonations,
  getDonationById,
  cancelDonation,
  getAllDonations,
  updateDonationStatus
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router.post('/', authorize(ROLES.DONOR), createDonation);
router.get('/my', authorize(ROLES.DONOR), getMyDonations);
router.get('/:id', getDonationById);
router.patch('/:id/cancel', authorize(ROLES.DONOR), cancelDonation);

router.get('/', authorize(ROLES.ADMIN, ROLES.HOSPITAL), getAllDonations);
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.HOSPITAL), updateDonationStatus);

module.exports = router;
