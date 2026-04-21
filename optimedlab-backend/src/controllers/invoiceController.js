const Invoice = require("../models/Invoice");
const Quote = require("../models/Quote");
const Client = require("../models/Client");
const { generateInvoiceNumber } = require("../utils/numberGenerator");
const { generateInvoicePDF } = require("../utils/pdfGenerator");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const { createNotification } = require("./notificationController");

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private (commercial, director)
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("client", "name email")
      // 👇 ADDED 'images price sku' HERE 👇
      .populate("items.product", "name images price sku")
      .populate("createdBy", "name")
      .populate("quote", "quoteNumber")
      .sort("-createdAt");
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private (commercial, director)
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("client")
      // 👇 ADDED 'images price sku' HERE 👇
      .populate("items.product", "name images price sku")
      .populate("createdBy", "name")
      .populate("quote");
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create invoice from quote
// @route   POST /api/invoices/from-quote/:quoteId
// @access  Private (commercial)
const createInvoiceFromQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.quoteId)
      .populate("client")
      .populate("items.product");
    if (!quote) {
      return res
        .status(404)
        .json({ success: false, message: "Quote not found" });
    }
    if (quote.status !== "validated") {
      return res.status(400).json({
        success: false,
        message: "Only validated quotes can be invoiced",
      });
    }

    // Check if invoice already exists for this quote
    const existing = await Invoice.findOne({ quote: quote._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Invoice already created for this quote",
      });
    }

    // Check stock availability
    for (const item of quote.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product.name} not found`,
        });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, requested: ${item.quantity}`,
        });
      }
    }

    const invoiceNumber = await generateInvoiceNumber(Invoice);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      quote: quote._id,
      client: quote.client._id,
      items: quote.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
      })),
      total: quote.total,
      createdBy: req.user.id,
      paymentStatus: "unpaid",
      dueDate,
    });

    // Update stock and create movements
    for (const item of quote.items) {
      const product = await Product.findById(item.product._id);
      product.stockQuantity -= item.quantity;
      await product.save();

      await StockMovement.create({
        product: product._id,
        type: "out",
        quantity: item.quantity,
        reference: `Invoice ${invoiceNumber}`,
        user: req.user.id,
      });
    }

    // Update quote status to invoiced
    quote.status = "invoiced";
    await quote.save();

    const populated = await Invoice.findById(invoice._id)
      .populate("client", "name email")
      .populate("items.product", "name")
      .populate("createdBy", "name")
      .populate("quote", "quoteNumber");

    res.status(201).json({ success: true, data: populated });

    // Notify admin/director and the commercial who created the quote
    const User = require("../models/User");
    const usersToNotify = await User.find({
      role: { $in: ["admin", "director"] },
      isBanned: false,
    }).select("_id");

    // Also notify quote creator if different
    if (quote.createdBy) {
      usersToNotify.push({ _id: quote.createdBy });
    }

    const uniqueUsers = [
      ...new Set(usersToNotify.map((u) => u._id.toString())),
    ];
    for (const userId of uniqueUsers) {
      await createNotification({
        userId,
        type: "invoice_created",
        title: "🧾 Facture générée",
        message: `Facture n°${invoice.invoiceNumber} pour ${quote.client.name}`,
        link: `/invoices/${invoice._id}`,
        metadata: { invoiceId: invoice._id },
      });
    }
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update invoice payment status
// @route   PUT /api/invoices/:id/payment
// @access  Private (commercial)
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    // Prevent changing status if overdue
    if (invoice.dueDate && new Date() > new Date(invoice.dueDate)) {
      return res.status(400).json({
        success: false,
        message: "Cannot change payment status of an overdue invoice",
      });
    }

    invoice.paymentStatus = paymentStatus;
    await invoice.save();
    res.json({ success: true, data: invoice });

    if (paymentStatus === "paid") {
      const User = require("../models/User");
      const admins = await User.find({
        role: { $in: ["admin", "director"] },
        isBanned: false,
      }).select("_id");
      for (const u of admins) {
        await createNotification({
          userId: u._id,
          type: "invoice_paid",
          title: "💰 Facture payée",
          message: `Facture n°${invoice.invoiceNumber} marquée comme payée`,
          link: `/invoices/${invoice._id}`,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate PDF for invoice
// @route   GET /api/invoices/:id/pdf
// @access  Private (commercial, director)
const getInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("client")
      .populate("items.product");
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    const pdfBuffer = await generateInvoicePDF(invoice, invoice.client);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoiceFromQuote,
  updatePaymentStatus,
  getInvoicePDF,
};
