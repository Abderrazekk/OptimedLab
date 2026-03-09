
const Client = require('../models/Client');

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
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: clients.length,
      data: clients
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
    const { name, email, phone, address, company, notes } = req.body;

    const client = await Client.create({
      name,
      email,
      phone,
      address,
      company,
      notes,
      createdBy: req.user.id
    });

    const populatedClient = await Client.findById(client._id).populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedClient
    });
  } catch (error) {
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
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Check ownership or admin? Admin can update any, commercial only their own? 
    // Requirement: "update (admin, commercial)" – we assume commercial can update any client as well (since they see all). If you want commercial to update only their own, add condition.
    // We'll allow both admin and commercial to update any client.

    client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
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
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    await client.deleteOne();

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getClients,
  createClient,
  updateClient,
  deleteClient
};