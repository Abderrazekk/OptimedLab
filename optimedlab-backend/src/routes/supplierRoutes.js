// routes/supplierRoutes.js
const express = require('express');
const { 
  getSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier 
} = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/suppliers – admin, stock, director
router.get('/', allowRoles('admin', 'stock', 'director'), getSuppliers);

// POST /api/suppliers – admin, stock
router.post('/', allowRoles('admin', 'stock'), createSupplier);

// PUT /api/suppliers/:id – admin, stock
router.put('/:id', allowRoles('admin', 'stock'), updateSupplier);

// DELETE /api/suppliers/:id – admin, stock
router.delete('/:id', allowRoles('admin', 'stock'), deleteSupplier);

module.exports = router;