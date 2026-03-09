const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("supplier", "name email")
      .populate("createdBy", "name email")
      .sort("-createdAt");
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("supplier", "name email")
      .populate("createdBy", "name email");
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user.id,
    };

    // Store relative paths for images (important!)
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(
        (file) => "uploads/products/" + file.filename,
      );
    }

    const product = await Product.create(productData);
    const populated = await Product.findById(product._id)
      .populate("supplier", "name email")
      .populate("createdBy", "name email");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const updateData = { ...req.body };

    // Handle new images
    if (req.files && req.files.length > 0) {
      // Delete old images from disk
      if (product.images && product.images.length > 0) {
        product.images.forEach((imagePath) => {
          const fullPath = path.join(__dirname, "..", "..", imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
      // Store new relative paths
      updateData.images = req.files.map(
        (file) => "uploads/products/" + file.filename,
      );
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("supplier", "name email")
      .populate("createdBy", "name email");

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Delete associated images from disk
    if (product.images && product.images.length > 0) {
      product.images.forEach((imagePath) => {
        const fullPath = path.join(__dirname, "..", "..", imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById, // <-- export new function
  createProduct,
  updateProduct,
  deleteProduct,
};
