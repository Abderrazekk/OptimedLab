const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "stock_alert",
        "stock_critical",
        "quote_created",
        "quote_validated",
        "invoice_created",
        "invoice_paid",
        "po_created",
        "po_received",
        "visit_scheduled",
        "client_added",
        "user_created",
        "user_role_changed",
        "user_banned",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String, // e.g., "/quotes/QUOTE-2025-001"
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // store extra context (productId, quoteId, etc.)
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast unread count queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);