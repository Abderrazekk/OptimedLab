const mongoose = require("mongoose");

const VisitSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Veuillez spécifier une date"],
    },
    // CHANGED: Now an array to support multiple commercials
    commercials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Veuillez assigner au moins un commercial"],
      },
    ],
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Veuillez sélectionner un client"],
    },
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
