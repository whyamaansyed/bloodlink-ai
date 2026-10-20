const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/inventory', getDashboardSummary);
router.get('/demand', getDashboardSummary);

module.exports = router;
