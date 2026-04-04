const Visit = require("../models/Visit");
const User = require("../models/User");
const Client = require("../models/Client");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const StockMovement = require("../models/StockMovement"); // <-- ADD THIS

const getVisits = async (req, res) => {
  try {
    const visits = await Visit.find({})
      .populate("commercial", "name avatar")
      .populate("client", "name address phone")
      .populate("products.product", "name"); // Update populate path

    res.status(200).json(visits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createVisit = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== "commercial" || !user.isSuperCommercial) {
      return res
        .status(403)
        .json({ message: "Seul un Super Commercial peut créer une visite." });
    }

    const { date, commercial, client, products, notes, color } = req.body;

    // Fetch client to use their name in the stock movement reference
    const clientData = await Client.findById(client);
    const referenceText = `Visite/Livraison Client : ${clientData ? clientData.name : "Inconnu"}`;

    const newVisit = await Visit.create({
      date,
      commercial,
      client,
      products,
      notes,
      color,
      createdBy: req.user.id,
    });

    // AUTOMATIC STOCK DEDUCTION & MOVEMENT LOGGING
    if (products && products.length > 0) {
      for (let item of products) {
        // 1. Deduct from main stock
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: -item.quantity },
        });

        // 2. Create history trace in StockMovements
        await StockMovement.create({
          product: item.product,
          type: "out",
          quantity: item.quantity,
          reference: referenceText,
          note:
            notes || "Sortie générée automatiquement par l'agenda des visites.",
          user: req.user.id,
        });
      }
    }

    res.status(201).json(newVisit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get required form data for creating a visit
// @route   GET /api/visits/form-data
// @access  Private
const getFormData = async (req, res) => {
  try {
    // Fetch only the specific fields needed for the dropdowns
    const commercials = await User.find({
      role: "commercial",
      isBanned: false,
    }).select("name _id");
    const clients = await Client.find({}).select("name _id");
    const suppliers = await Supplier.find({}).select("name _id");
    const products = await Product.find({})
      .populate("supplier", "name _id")
      .select("name stockQuantity supplier _id");

    res.status(200).json({
      success: true,
      commercials,
      clients,
      suppliers,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getVisits, createVisit, getFormData };
