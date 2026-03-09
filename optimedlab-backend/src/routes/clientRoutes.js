// routes/clientRoutes.js
const express = require('express');
const { 
  getClients, 
  createClient, 
  updateClient, 
  deleteClient 
} = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/clients – accessible by admin, commercial, director
router.get('/', allowRoles('admin', 'commercial', 'director'), getClients);

// POST /api/clients – accessible by admin, commercial
router.post('/', allowRoles('admin', 'commercial'), createClient);

// PUT /api/clients/:id – accessible by admin, commercial
router.put('/:id', allowRoles('admin', 'commercial'), updateClient);

// DELETE /api/clients/:id – accessible only by admin
router.delete('/:id', allowRoles('admin'), deleteClient);

module.exports = router;