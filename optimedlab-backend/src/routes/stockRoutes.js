
const express = require('express');
const {
  getStockList,
  getMovements,
  getAlerts,
  adjustStock
} = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

// GET /api/stock – all roles
router.get('/', allowRoles('admin', 'stock', 'commercial', 'director'), getStockList);

// GET /api/stock/movements – admin/stock full; commercial/director view
// We'll allow all, but frontend can restrict UI; backend can also differentiate if needed.
// For simplicity, we allow all authenticated to view movements, but we may add role-based filtering later.
router.get('/movements', allowRoles('admin', 'stock', 'commercial', 'director'), getMovements);

// GET /api/stock/alerts – all roles
router.get('/alerts', allowRoles('admin', 'stock', 'commercial', 'director'), getAlerts);

// POST /api/stock/adjust – admin and stock only
router.post('/adjust', allowRoles('admin', 'stock'), adjustStock);

module.exports = router;