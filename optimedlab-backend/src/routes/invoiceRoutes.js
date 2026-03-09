const express = require('express');
const { 
  getInvoices, 
  getInvoiceById, 
  createInvoiceFromQuote, 
  updatePaymentStatus,
  getInvoicePDF
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

// GET /api/invoices – commercial and director
router.get('/', allowRoles('commercial', 'director'), getInvoices);

// GET /api/invoices/:id – commercial and director
router.get('/:id', allowRoles('commercial', 'director'), getInvoiceById);

// POST /api/invoices/from-quote/:quoteId – commercial only
router.post('/from-quote/:quoteId', allowRoles('commercial'), createInvoiceFromQuote);

// PUT /api/invoices/:id/payment – commercial only
router.put('/:id/payment', allowRoles('commercial'), updatePaymentStatus);

// GET /api/invoices/:id/pdf – commercial and director
router.get('/:id/pdf', allowRoles('commercial', 'director'), getInvoicePDF);

module.exports = router;