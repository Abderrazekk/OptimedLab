const Supplier = require("../models/Supplier");

// @desc    Get all suppliers
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find()
      .populate("createdBy", "name email")
      .sort("-createdAt");
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a supplier
const createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, email, phone, website, notes, bgColor } =
      req.body;

    // Reconstruct address from FormData
    const address = {
      street: req.body["address.street"] || "",
      city: req.body["address.city"] || "",
      state: req.body["address.state"] || "",
      zipCode: req.body["address.zipCode"] || "",
      country: req.body["address.country"] || "",
    };

    const supplierData = {
      name,
      contactPerson,
      email,
      phone,
      address,
      website,
      notes,
      bgColor,
      createdBy: req.user.id,
    };

    if (req.file) {
      supplierData.image = `/uploads/suppliers/${req.file.filename}`;
    }

    const supplier = await Supplier.create(supplierData);
    const populated = await Supplier.findById(supplier._id).populate(
      "createdBy",
      "name email",
    );

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a supplier
const updateSupplier = async (req, res) => {
  try {
    let supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    }

    const updateData = {
      name: req.body.name,
      contactPerson: req.body.contactPerson,
      email: req.body.email,
      phone: req.body.phone,
      website: req.body.website,
      notes: req.body.notes,
      bgColor: req.body.bgColor,
    };

    if (req.body["address.street"] !== undefined) {
      updateData.address = {
        street: req.body["address.street"],
        city: req.body["address.city"],
        state: req.body["address.state"],
        zipCode: req.body["address.zipCode"],
        country: req.body["address.country"],
      };
    }

    if (req.file) {
      updateData.image = `/uploads/suppliers/${req.file.filename}`;
    }

    supplier = await Supplier.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a supplier
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier)
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });

    const Product = require("../models/Product");
    const productsUsing = await Product.findOne({ supplier: supplier._id });

    if (productsUsing) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Cannot delete supplier because it is used by one or more products.",
        });
    }

    await supplier.deleteOne();
    res.json({ success: true, message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
