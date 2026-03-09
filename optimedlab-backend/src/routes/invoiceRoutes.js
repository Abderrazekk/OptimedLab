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
router.get('/', allowRoles('admin', 'commercial', 'director'), getInvoices);

// GET /api/invoices/:id – commercial and director
router.get('/:id', allowRoles('admin', 'commercial', 'director'), getInvoiceById);

// POST /api/invoices/from-quote/:quoteId – commercial only
router.post('/from-quote/:quoteId', allowRoles('admin', 'commercial'), createInvoiceFromQuote);

// PUT /api/invoices/:id/payment – commercial only
router.put('/:id/payment', allowRoles('admin', 'commercial'), updatePaymentStatus);

// GET /api/invoices/:id/pdf – commercial and director
router.get('/:id/pdf', allowRoles('admin', 'commercial', 'director'), getInvoicePDF);

module.exports = router;