const mongoose = require("mongoose");

const QuoteItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const QuoteSchema = new mongoose.Schema(
  {
    quoteNumber: {
      type: String,
      required: true,
      unique: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    items: [QuoteItemSchema],
    remise: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalHT: {
      type: Number,
      required: true,
      min: 0,
    },
    tvaAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    timbreAmount: {
      type: Number,
      default: 1.0, // Fixed Timbre value in TND
    },
    totalTTC: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "validated", "invoiced"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

module.exports = mongoose.model("Quote", QuoteSchema);
