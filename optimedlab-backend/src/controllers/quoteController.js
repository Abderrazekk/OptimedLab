const Quote = require("../models/Quote");
const Client = require("../models/Client");
const Product = require("../models/Product");
const { generateQuoteNumber } = require("../utils/numberGenerator");
const { generateQuotePDF } = require("../utils/pdfGenerator");

// @desc    Get all quotes
// @route   GET /api/quotes
// @access  Private (commercial, director)
const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find()
      .populate("client", "name email company")
      // 👇 ADDED 'images' and 'price' HERE 👇
      .populate("items.product", "name images price sku")
      .populate("createdBy", "name")
      .sort("-createdAt");
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single quote
// @route   GET /api/quotes/:id
// @access  Private (commercial, director)
const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate("client")
      // 👇 ADDED 'images' and 'price' HERE 👇
      .populate("items.product", "name images price sku")
      .populate("createdBy", "name");
    if (!quote) {
      return res
        .status(404)
        .json({ success: false, message: "Quote not found" });
    }
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a quote
// @route   POST /api/quotes
// @access  Private (commercial)
const createQuote = async (req, res) => {
  try {
    const { client, items } = req.body;

    // Validate required fields
    if (!client || !items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Client and items are required" });
    }

    // Validate client exists
    const clientExists = await Client.findById(client);
    if (!clientExists) {
      return res
        .status(400)
        .json({ success: false, message: "Client not found" });
    }

    // Validate products and calculate total
    let total = 0;
    const validatedItems = [];
    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a product and valid quantity",
        });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product} not found`,
        });
      }

      // Use price from request if provided, otherwise from product
      let price = item.price;
      if (price === undefined || price === null || isNaN(price)) {
        price = product.price;
      }
      // Ensure price is a number
      price = Number(price);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for product ${product.name}`,
        });
      }

      validatedItems.push({
        product: item.product,
        quantity: Number(item.quantity),
        price: price,
      });
      total += price * Number(item.quantity);
    }

    // Generate quote number
    const quoteNumber = await generateQuoteNumber(Quote);

    // Create quote
    const quote = await Quote.create({
      quoteNumber,
      client,
      items: validatedItems,
      total,
      createdBy: req.user.id,
      status: "draft",
    });

    // Populate for response
    const populated = await Quote.findById(quote._id)
      .populate("client", "name email")
      .populate("items.product", "name images price sku")
      .populate("createdBy", "name");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("❌ CREATE QUOTE ERROR:", error); // This will print full stack trace
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// @desc    Update a quote (only if draft)
// @route   PUT /api/quotes/:id
// @access  Private (commercial)
const updateQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res
        .status(404)
        .json({ success: false, message: "Quote not found" });
    }
    if (quote.status !== "draft") {
      return res
        .status(400)
        .json({ success: false, message: "Only draft quotes can be edited" });
    }

    const { client, items } = req.body;

    // Recalculate total if items changed
    let total = quote.total;
    if (items) {
      total = 0;
      const validatedItems = [];
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.product} not found`,
          });
        }
        const price = item.price || product.price;
        validatedItems.push({
          product: item.product,
          quantity: item.quantity,
          price: price,
        });
        total += price * item.quantity;
      }
      quote.items = validatedItems;
    }

    if (client) quote.client = client;
    quote.total = total;

    await quote.save();

    const updated = await Quote.findById(quote._id)
      .populate("client", "name email")
      .populate("items.product", "name images price sku")
      .populate("createdBy", "name");

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a quote (only if draft)
// @route   DELETE /api/quotes/:id
// @access  Private (commercial)
const deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res
        .status(404)
        .json({ success: false, message: "Quote not found" });
    }
    if (quote.status !== "draft") {
      return res
        .status(400)
        .json({ success: false, message: "Only draft quotes can be deleted" });
    }
    await quote.deleteOne();
    res.json({ success: true, message: "Quote deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate a quote (change status to validated)
// @route   PUT /api/quotes/:id/validate
// @access  Private (commercial)
const validateQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res
        .status(404)
        .json({ success: false, message: "Quote not found" });
    }
    if (quote.status !== "draft") {
      return res
        .status(400)
        .json({ success: false, message: "Quote already processed" });
    }
    quote.status = "validated";
    await quote.save();
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate PDF for quote
// @route   GET /api/quotes/:id/pdf
// @access  Private (commercial, director)
const getQuotePDF = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate("client")
      .populate("items.product");
    if (!quote) {
      return res
        .status(404)
        .json({ success: false, message: "Quote not found" });
    }

    const pdfBuffer = await generateQuotePDF(quote, quote.client);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=quote-${quote.quoteNumber}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
  validateQuote,
  getQuotePDF,
};
