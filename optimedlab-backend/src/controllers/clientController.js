const Client = require("../models/Client");
const { createNotification } = require("./notificationController");

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private (Admin, Commercial, Director)
const getClients = async (req, res) => {
  try {
    let query = {};

    // If user is commercial, they might see only their own clients?
    // Requirement: "Commercial sees all? Probably yes." We'll allow all for simplicity.
    // If you want commercial to see only theirs, add condition: if (req.user.role === 'commercial') query.createdBy = req.user.id;

    const clients = await Client.find(query)
      .populate("createdBy", "name email")
      .sort("-createdAt");

    res.json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a client
// @route   POST /api/clients
// @access  Private (Admin, Commercial)
const createClient = async (req, res) => {
  try {
    const { name, email, phone, company, notes } = req.body;

    // Handle nested address fields sent via FormData
    const address = {
      street: req.body["address.street"] || "",
      city: req.body["address.city"] || "",
      state: req.body["address.state"] || "",
      zipCode: req.body["address.zipCode"] || "",
      country: req.body["address.country"] || "",
    };

    // Capture the uploaded image filename
    let image = "";
    if (req.file) {
      image = req.file.filename;
    }

    const client = await Client.create({
      name,
      email,
      phone,
      address,
      company,
      notes,
      image,
      createdBy: req.user._id, // Use req.user._id or req.user.id depending on your auth middleware
    });

    const populatedClient = await Client.findById(client._id).populate(
      "createdBy",
      "name email",
    );

    res.status(201).json({ success: true, data: populatedClient });

    // Notify all commercials, admin, director
    const User = require("../models/User");
    const usersToNotify = await User.find({
      role: { $in: ["commercial", "admin", "director"] },
      isBanned: false,
    }).select("_id");

    for (const u of usersToNotify) {
      await createNotification({
        userId: u._id,
        type: "client_added",
        title: "👤 Nouveau client ajouté",
        message: `${name} ajouté par ${req.user.name}`,
        link: `/clients/${client._id}`,
      });
    }
  } catch (error) {
    console.error("Error creating client:", error); // <-- This will log the exact error in your terminal
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Private (Admin, Commercial)
const updateClient = async (req, res) => {
  try {
    let client = await Client.findById(req.params.id);

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Create a clean update object
    const updateData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company: req.body.company,
      notes: req.body.notes,
    };

    // Reconstruct address object safely
    if (req.body["address.street"] !== undefined) {
      updateData.address = {
        street: req.body["address.street"],
        city: req.body["address.city"],
        state: req.body["address.state"],
        zipCode: req.body["address.zipCode"],
        country: req.body["address.country"],
      };
    }

    // Capture new image if uploaded
    if (req.file) {
      updateData.image = req.file.filename;
    }

    client = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).populate("createdBy", "name email");

    res.json({ success: true, data: client });
  } catch (error) {
    console.error("Error updating client:", error); // <-- This will log the exact error in your terminal
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Private (Admin only)
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    await client.deleteOne();

    res.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getClients,
  createClient,
  updateClient,
  deleteClient,
};
