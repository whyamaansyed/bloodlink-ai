const express = require('express');
const { getDonors, getDonorById, createDonor, updateDonor, deleteDonor } = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('ADMIN'), getDonors)
  .post(authorize('ADMIN'), createDonor);

router.route('/:id')
  .get(getDonorById)
  .put(updateDonor)
  .delete(authorize('ADMIN'), deleteDonor);

module.exports = router;
