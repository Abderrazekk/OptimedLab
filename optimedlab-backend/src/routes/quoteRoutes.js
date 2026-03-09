const express = require('express');
const { 
  getQuotes, 
  getQuoteById, 
  createQuote, 
  updateQuote, 
  deleteQuote, 
  validateQuote,
  getQuotePDF
} = require('../controllers/quoteController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

// GET /api/quotes – commercial and director
router.get('/', allowRoles('admin', 'commercial', 'director'), getQuotes);

// GET /api/quotes/:id – commercial and director
router.get('/:id', allowRoles('admin', 'commercial', 'director'), getQuoteById);

// POST /api/quotes – commercial only
router.post('/', allowRoles('admin', 'commercial'), createQuote);

// PUT /api/quotes/:id – commercial only
router.put('/:id', allowRoles('admin', 'commercial'), updateQuote);

// DELETE /api/quotes/:id – commercial only
router.delete('/:id', allowRoles('admin', 'commercial'), deleteQuote);

// PUT /api/quotes/:id/validate – commercial only
router.put('/:id/validate', allowRoles('admin', 'commercial'), validateQuote);

// GET /api/quotes/:id/pdf – commercial and director
router.get('/:id/pdf', allowRoles('admin', 'commercial', 'director'), getQuotePDF);

module.exports = router;