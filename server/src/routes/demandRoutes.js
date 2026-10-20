const express = require('express');
const { getDemandMetrics, getEstimations, createDemandRecord } = require('../controllers/demandController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getDemandMetrics);
router.get('/summary', getDemandMetrics);
router.get('/trends', getDemandMetrics);
router.get('/estimate', getEstimations);
router.post('/', authorize('ADMIN'), createDemandRecord);

module.exports = router;
