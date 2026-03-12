const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

// @desc    Get all products with stock (list)
// @route   GET /api/stock
// @access  Private (all roles)
const getStockList = async (req, res) => {
  try {
    const products = await Product.find()
      // Add 'description' here so the modal can display it:
      .select(
        "name sku description category stockQuantity threshold price supplier images shelfLocation",
      )
      .populate("supplier", "name");
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stock movement history (with pagination)
// @route   GET /api/stock/movements
// @access  Private (admin/stock full; others view)
const getMovements = async (req, res) => {
  try {
    const {
      productId,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    if (productId) filter.product = productId;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        filter.createdAt.$lt = end;
      }
    }

    const movements = await StockMovement.find(filter)
      // 👇 THIS IS THE CRITICAL LINE THAT FIXES THE N/A AND MISSING IMAGES 👇
      .populate("product", "name sku images stockQuantity")
      .populate("user", "name")
      .sort("-createdAt")
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockMovement.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get stock alerts (products below threshold)
// @route   GET /api/stock/alerts
// @access  Private (all roles)
const getAlerts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$stockQuantity", "$threshold"] },
    }).select("name sku stockQuantity threshold supplier");
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manual stock adjustment
// @route   POST /api/stock/adjust
// @access  Private (admin, stock)
const adjustStock = async (req, res) => {
  try {
    const { productId, type, quantity, note } = req.body;

    // Force the quantity to be a mathematical integer
    const parsedQuantity = parseInt(quantity, 10);

    if (!productId || !type || !parsedQuantity || parsedQuantity <= 0) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Update stock using the parsed mathematical number
    if (type === "in") {
      product.stockQuantity += parsedQuantity;
    } else if (type === "out") {
      if (product.stockQuantity < parsedQuantity) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient stock" });
      }
      product.stockQuantity -= parsedQuantity;
    } else {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }

    await product.save();

    // Create movement record
    const movement = await StockMovement.create({
      product: productId,
      type,
      quantity: parsedQuantity,
      reference: "Manual adjustment",
      note: note || "",
      user: req.user.id,
    });

    res.json({
      success: true,
      data: {
        product,
        movement,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStockList,
  getMovements,
  getAlerts,
  adjustStock,
};
