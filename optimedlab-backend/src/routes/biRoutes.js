// routes/biRoutes.js
const express = require('express');
const { getDashboardStats, generateReport } = require('../controllers/biController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

// GET /api/bi/dashboard – all roles can view
router.get('/dashboard', allowRoles('admin', 'commercial', 'stock', 'director'), getDashboardStats);

// POST /api/bi/reports – generate reports (director full, others maybe view only? we'll allow all for now)
router.post('/reports', allowRoles('admin', 'commercial', 'stock', 'director'), generateReport);

module.exports = router;