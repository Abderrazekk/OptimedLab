const mongoose = require("mongoose");
const Visit = require("../models/Visit");
const User = require("../models/User");
const Client = require("../models/Client");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const StockMovement = require("../models/StockMovement");
const { createNotification } = require("./notificationController");

// ------------------------------------------------------------
// GET all visits
// ------------------------------------------------------------
const getVisits = async (req, res) => {
  try {
    const visits = await Visit.find({})
      .populate("commercials", "name avatar")
      .populate("client", "name address phone")
      .populate("products.product", "name");
    res.status(200).json(visits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------------
// CREATE visit (manual rollback)
// ------------------------------------------------------------
const createVisit = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== "commercial" || !user.isSuperCommercial) {
      return res
        .status(403)
        .json({ message: "Seul un Super Commercial peut créer une visite." });
    }

    const { date, commercials, client, products, notes, color } = req.body;

    // -------- Validate stock availability --------
    if (products && products.length > 0) {
      for (const item of products) {
        const product = await Product.findById(item.product);
        if (!product || product.stockQuantity < item.quantity) {
          return res.status(400).json({
            message: `Stock insuffisant pour ${product?.name || item.product}`,
          });
        }
      }
    }

    // -------- Create visit document --------
    const newVisit = await Visit.create({
      date,
      commercials,
      client,
      products,
      notes,
      color,
      createdBy: req.user.id,
    });

    // -------- Deduct stock & create movements --------
    const affectedProducts = []; // to track for rollback
    if (products && products.length > 0) {
      const clientData = await Client.findById(client);
      const referenceText = `Visite/Livraison Client : ${clientData?.name || "Inconnu"}`;

      for (const item of products) {
        try {
          // Deduct stock
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockQuantity: -item.quantity },
          });

          // Record movement
          await StockMovement.create({
            product: item.product,
            type: "out",
            quantity: item.quantity,
            reference: referenceText,
            note:
              notes ||
              "Sortie générée automatiquement par l'agenda des visites.",
            user: req.user.id,
          });

          affectedProducts.push(item.product);
        } catch (error) {
          // If any product operation fails, rollback stock for already processed products
          for (const prodId of affectedProducts) {
            // find the original quantity of that product in this visit
            const originalQuantity = products.find(
              (p) => p.product.toString() === prodId.toString(),
            ).quantity;
            await Product.findByIdAndUpdate(prodId, {
              $inc: { stockQuantity: originalQuantity },
            });
          }
          // Delete the visit because it's now inconsistent
          await Visit.findByIdAndDelete(newVisit._id);
          return res
            .status(500)
            .json({
              message:
                "Erreur lors de la mise à jour du stock, veuillez réessayer.",
            });
        }
      }
    }

    // Populate for response
    const populated = await Visit.findById(newVisit._id)
      .populate("commercials", "name avatar")
      .populate("client", "name address phone")
      .populate("products.product", "name");

    res.status(201).json(populated);

    // Notifications (outside critical path)
    const clientData = await Client.findById(client);
    for (const commId of commercials) {
      createNotification({
        userId: commId,
        type: "visit_scheduled",
        title: "📅 Nouvelle visite planifiée",
        message: `Visite chez ${clientData?.name} le ${new Date(date).toLocaleString()}`,
        link: "/calendar",
        metadata: { visitId: newVisit._id },
      }).catch((err) => console.error("Notification failed:", err));
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------------
// UPDATE visit (manual rollback)
// ------------------------------------------------------------
const updateVisit = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Visite introuvable" });
    }

    // Authorization
    const user = await User.findById(req.user.id);
    if (visit.createdBy.toString() !== req.user.id && !user.isSuperCommercial) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    const { date, commercials, client, products, notes, color } = req.body;

    // Build old/new stock maps
    const oldProductsMap = {};
    visit.products.forEach(
      (p) => (oldProductsMap[p.product.toString()] = p.quantity),
    );

    const newProductsArray = products || [];
    const newProductsMap = {};
    newProductsArray.forEach((p) => {
      if (p.product) newProductsMap[p.product] = p.quantity;
    });

    // Validate stock for new products (only increases matter)
    for (const item of newProductsArray) {
      if (!item.product) continue;
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(400)
          .json({ message: `Produit ${item.product} introuvable` });
      }
      const oldQty = oldProductsMap[item.product] || 0;
      const additionalNeeded = item.quantity - oldQty;
      if (additionalNeeded > product.stockQuantity) {
        return res.status(400).json({
          message: `Stock insuffisant pour ${product.name}. Disponible: ${product.stockQuantity}, requis en plus: ${additionalNeeded}`,
        });
      }
    }

    // Identify all affected product IDs
    const allProductIds = new Set([
      ...Object.keys(oldProductsMap),
      ...Object.keys(newProductsMap),
    ]);

    const clientData = await Client.findById(client || visit.client);
    const referenceText = `Modification visite chez ${clientData?.name || "Inconnu"}`;
    const performedAdjustments = []; // {productId, deltaFromOld} for rollback

    // Process stock adjustments
    for (const prodId of allProductIds) {
      const oldQty = oldProductsMap[prodId] || 0;
      const newQty = newProductsMap[prodId] || 0;
      const delta = newQty - oldQty;
      if (delta === 0) continue;

      try {
        if (delta > 0) {
          // Deduct more
          await Product.findByIdAndUpdate(prodId, {
            $inc: { stockQuantity: -delta },
          });
          await StockMovement.create({
            product: prodId,
            type: "out",
            quantity: delta,
            reference: referenceText,
            note: notes || "Ajustement stock - sortie supplémentaire",
            user: req.user.id,
          });
        } else {
          // Return stock
          const revert = Math.abs(delta);
          await Product.findByIdAndUpdate(prodId, {
            $inc: { stockQuantity: revert },
          });
          await StockMovement.create({
            product: prodId,
            type: "in",
            quantity: revert,
            reference: referenceText,
            note: "Ajustement stock - retour suite modification",
            user: req.user.id,
          });
        }
        performedAdjustments.push({ prodId, delta });
      } catch (error) {
        // Rollback previously applied adjustments
        for (const adj of performedAdjustments) {
          // Undo: if adj.delta > 0, we had deducted, so add back; if negative, we had added, so deduct
          const correction = adj.delta > 0 ? adj.delta : -adj.delta;
          await Product.findByIdAndUpdate(adj.prodId, {
            $inc: { stockQuantity: adj.delta > 0 ? adj.delta : -adj.delta },
          });
        }
        return res
          .status(500)
          .json({
            message:
              "Erreur lors de l'ajustement du stock, modifications annulées.",
          });
      }
    }

    // Update visit fields
    if (date !== undefined) visit.date = date;
    if (commercials !== undefined) visit.commercials = commercials;
    if (client !== undefined) visit.client = client;
    if (products !== undefined) visit.products = newProductsArray;
    if (notes !== undefined) visit.notes = notes;
    if (color !== undefined) visit.color = color;

    await visit.save();

    const populatedVisit = await Visit.findById(visit._id)
      .populate("commercials", "name avatar")
      .populate("client", "name address phone")
      .populate("products.product", "name");

    res.status(200).json(populatedVisit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------------
// DELETE visit (manual rollback stock)
// ------------------------------------------------------------
const deleteVisit = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Visite introuvable" });
    }

    const user = await User.findById(req.user.id);
    if (visit.createdBy.toString() !== req.user.id && !user.isSuperCommercial) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    // Revert stock
    const clientData = await Client.findById(visit.client);
    const referenceText = `Annulation visite chez ${clientData?.name || "Inconnu"}`;
    const revertedProducts = [];

    for (const item of visit.products) {
      try {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity },
        });
        await StockMovement.create({
          product: item.product,
          type: "in",
          quantity: item.quantity,
          reference: referenceText,
          note: "Annulation de la visite – stock restitué",
          user: req.user.id,
        });
        revertedProducts.push(item.product);
      } catch (error) {
        // Rollback already reverted products
        for (const prodId of revertedProducts) {
          const originalItem = visit.products.find(
            (p) => p.product.toString() === prodId.toString(),
          );
          await Product.findByIdAndUpdate(prodId, {
            $inc: { stockQuantity: -originalItem.quantity },
          });
        }
        return res
          .status(500)
          .json({
            message:
              "Erreur lors de la restitution du stock. Annulation annulée.",
          });
      }
    }

    // Delete the visit
    await Visit.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Visite supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------------
// GET form data
// ------------------------------------------------------------
const getFormData = async (req, res) => {
  try {
    const commercials = await User.find({
      role: "commercial",
      isBanned: false,
    }).select("name _id");
    const clients = await Client.find({}).select("name _id");
    const suppliers = await Supplier.find({}).select("name _id");
    const products = await Product.find({})
      .populate("supplier", "name _id")
      .select("name stockQuantity supplier _id");

    res
      .status(200)
      .json({ success: true, commercials, clients, suppliers, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVisits,
  createVisit,
  getFormData,
  updateVisit,
  deleteVisit,
};
