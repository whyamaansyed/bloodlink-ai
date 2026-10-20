const express = require('express');
const {
  getInventory,
  getInventoryById,
  getUnitHistory,
  addBloodUnit,
  updateBloodUnit,
  deleteBloodUnit,
  getInventorySummary,
  getLowStockAlerts,
  getExpiringUnits
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', getInventorySummary);
router.get('/low-stock', getLowStockAlerts);
router.get('/expiring', getExpiringUnits);
router.get('/:id/history', getUnitHistory);

router.route('/')
  .get(getInventory)
  .post(authorize('ADMIN'), addBloodUnit);

router.route('/:id')
  .get(getInventoryById)
  .put(authorize('ADMIN'), updateBloodUnit)
  .delete(authorize('ADMIN'), deleteBloodUnit);

module.exports = router;
