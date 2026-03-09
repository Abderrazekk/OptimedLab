// controllers/purchaseOrderController.js
const PurchaseOrder = require("../models/PurchaseOrder");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const { generatePONumber } = require("../utils/numberGenerator");

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private (Admin, Stock, Director)
const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate("supplier", "name email")
      .populate("items.product", "name sku")
      .populate("createdBy", "name")
      .sort("-createdAt");
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single purchase order
// @route   GET /api/purchase-orders/:id
// @access  Private (Admin, Stock, Director)
const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate("supplier")
      .populate("items.product")
      .populate("createdBy", "name");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase order not found" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a purchase order
// @route   POST /api/purchase-orders
// @access  Private (Admin, Stock)
const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, items } = req.body;

    if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Supplier and items are required" });
    }

    // Validate items
    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Each item must have a product and valid quantity",
          });
      }
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Product with ID ${item.product} not found`,
          });
      }
    }

    const poNumber = await generatePONumber(PurchaseOrder);

    const order = await PurchaseOrder.create({
      poNumber,
      supplier,
      items,
      createdBy: req.user.id,
      status: "pending",
    });

    const populated = await PurchaseOrder.findById(order._id)
      .populate("supplier", "name email")
      .populate("items.product", "name")
      .populate("createdBy", "name");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("Create PO error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a purchase order (only if pending)
// @route   PUT /api/purchase-orders/:id
// @access  Private (Admin, Stock)
const updatePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase order not found" });
    }
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only pending orders can be updated",
        });
    }

    const { supplier, items } = req.body;
    if (supplier) order.supplier = supplier;
    if (items) {
      // Validate items
      for (const item of items) {
        if (!item.product || !item.quantity || item.quantity <= 0) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Each item must have a product and valid quantity",
            });
        }
        const product = await Product.findById(item.product);
        if (!product) {
          return res
            .status(400)
            .json({
              success: false,
              message: `Product with ID ${item.product} not found`,
            });
        }
      }
      order.items = items;
    }

    await order.save();

    const updated = await PurchaseOrder.findById(order._id)
      .populate("supplier", "name email")
      .populate("items.product", "name")
      .populate("createdBy", "name");

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a purchase order (only if pending)
// @route   DELETE /api/purchase-orders/:id
// @access  Private (Admin, Stock)
const deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase order not found" });
    }
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only pending orders can be deleted",
        });
    }
    await order.deleteOne();
    res.json({ success: true, message: "Purchase order deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark purchase order as received – updates stock and creates movements
// @route   PUT /api/purchase-orders/:id/receive
// @access  Private (Admin, Stock)
const receivePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id).populate(
      "items.product",
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase order not found" });
    }
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Order already received" });
    }

    // Update stock for each item
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Product ${item.product.name} not found`,
          });
      }
      product.stockQuantity += item.quantity;
      await product.save();

      // Create stock movement
      await StockMovement.create({
        product: product._id,
        type: "in",
        quantity: item.quantity,
        reference: `PO ${order.poNumber}`,
        user: req.user.id,
      });
    }

    order.status = "received";
    order.receivedAt = new Date();
    await order.save();

    const updated = await PurchaseOrder.findById(order._id)
      .populate("supplier", "name email")
      .populate("items.product", "name")
      .populate("createdBy", "name");

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Receive PO error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  receivePurchaseOrder,
};
