const express = require('express');
const { getHospitals, getHospitalById, createHospital, updateHospital } = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getHospitals)
  .post(authorize('ADMIN'), createHospital);

router.route('/:id')
  .get(getHospitalById)
  .put(updateHospital);

module.exports = router;
