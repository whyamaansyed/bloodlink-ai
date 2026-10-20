const express = require('express');
const { getThresholds, updateThreshold } = require('../controllers/thresholdController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', getThresholds);
router.put('/:id', updateThreshold);

module.exports = router;
