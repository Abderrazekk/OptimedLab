const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

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

// Helper function to extract shelfLocation from FormData
const extractShelfLocation = (body) => {
  if (
    body["shelfLocation[aisle]"] ||
    body["shelfLocation[shelfNumber]"] ||
    body["shelfLocation[binCode]"]
  ) {
    return {
      aisle: body["shelfLocation[aisle]"] || "",
      shelfNumber: parseInt(body["shelfLocation[shelfNumber]"]) || 0,
      binCode: body["shelfLocation[binCode]"] || "",
    };
  }
  return undefined;
};

// @desc    Create a product
// @route   POST /api/products
// @desc    Create a product
const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user.id,
    };

    // ✅ THE FIX: Parse the stringified JSON back into an object
    if (req.body.shelfLocation) {
      try {
        productData.shelfLocation = JSON.parse(req.body.shelfLocation);
      } catch (e) {
        console.error("Could not parse shelf location");
      }
    }

    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(
        (file) => "uploads/products/" + file.filename,
      );
    }

    let product = await Product.create(productData);

    // Generate QR Code holding the product's _id
    const qrCodeImage = await QRCode.toDataURL(product._id.toString());
    product.qrCode = qrCodeImage;
    await product.save();

    const populated = await Product.findById(product._id)
      .populate("supplier", "name email")
      .populate("createdBy", "name email");
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const updateData = { ...req.body };

    // ✅ THE FIX: Parse the stringified JSON back into an object
    if (req.body.shelfLocation) {
      try {
        updateData.shelfLocation = JSON.parse(req.body.shelfLocation);
      } catch (e) {
        console.error("Could not parse shelf location");
      }
    }

    if (req.files && req.files.length > 0) {
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
