// models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a product name"],
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  images: [
    {
      type: String, // relative path to image file (e.g., "uploads/products/filename.jpg")
    },
  ],
  price: {
    type: Number,
    required: [true, "Please add a price"],
    min: 0,
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
    enum: ["Equipment", "Reagent", "Consumable", "Spare Part", "Other"],
    default: "Other",
  },
  stockQuantity: {
    type: Number,
    required: [true, "Please add initial stock quantity"],
    min: 0,
    default: 0,
  },
  threshold: {
    type: Number,
    required: [true, "Please add alert threshold"],
    min: 0,
    default: 5,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: [true, "Please select a supplier"],
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
