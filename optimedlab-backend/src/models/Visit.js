const mongoose = require("mongoose");

const VisitSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Veuillez spécifier une date"],
    },
    commercial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Veuillez assigner un commercial"],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Veuillez sélectionner un client"],
    },
    // CHANGED: Now stores the product AND the quantity taken
    products: [
      {
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
      },
    ],
    notes: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#10b981",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Visit", VisitSchema);
