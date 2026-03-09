const mongoose = require("mongoose");

const PurchaseOrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
});

const PurchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: [PurchaseOrderItemSchema],
    status: { type: String, enum: ["pending", "received"], default: "pending" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receivedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PurchaseOrder", PurchaseOrderSchema);
