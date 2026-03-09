
const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private (Admin, Stock, Director)
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find()
      .populate('createdBy', 'name email')
      .sort('-createdAt');
    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private (Admin, Stock)
const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create({
      ...req.body,
      createdBy: req.user.id
    });
    const populated = await Supplier.findById(supplier._id).populate('createdBy', 'name email');
    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin, Stock)
const updateSupplier = async (req, res) => {
  try {
    let supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin, Stock)
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    // Check if any products reference this supplier
    const Product = require('../models/Product');
    const productsUsing = await Product.findOne({ supplier: supplier._id });
    if (productsUsing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete supplier because it is used by one or more products.' 
      });
    }
    await supplier.deleteOne();
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
};