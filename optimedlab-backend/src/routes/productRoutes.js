
const express = require('express');
const { 
  getProducts,
  getProductById,    
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const uploadProductImages = require('../middleware/uploadProductMiddleware');

const router = express.Router();

router.use(protect);

// GET all products
router.get('/', allowRoles('admin', 'stock', 'commercial', 'director'), getProducts);

// GET single product by ID
router.get('/:id', allowRoles('admin', 'stock', 'commercial', 'director'), getProductById);

// POST create product (with image upload)
router.post('/', allowRoles('admin', 'stock'), uploadProductImages.array('images', 5), createProduct);

// PUT update product (with optional image upload)
router.put('/:id', allowRoles('admin', 'stock'), uploadProductImages.array('images', 5), updateProduct);

// DELETE product
router.delete('/:id', allowRoles('admin', 'stock'), deleteProduct);

module.exports = router;