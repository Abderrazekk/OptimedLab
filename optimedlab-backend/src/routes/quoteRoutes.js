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
router.get('/', allowRoles('commercial', 'director'), getQuotes);

// GET /api/quotes/:id – commercial and director
router.get('/:id', allowRoles('commercial', 'director'), getQuoteById);

// POST /api/quotes – commercial only
router.post('/', allowRoles('commercial'), createQuote);

// PUT /api/quotes/:id – commercial only
router.put('/:id', allowRoles('commercial'), updateQuote);

// DELETE /api/quotes/:id – commercial only
router.delete('/:id', allowRoles('commercial'), deleteQuote);

// PUT /api/quotes/:id/validate – commercial only
router.put('/:id/validate', allowRoles('commercial'), validateQuote);

// GET /api/quotes/:id/pdf – commercial and director
router.get('/:id/pdf', allowRoles('commercial', 'director'), getQuotePDF);

module.exports = router;