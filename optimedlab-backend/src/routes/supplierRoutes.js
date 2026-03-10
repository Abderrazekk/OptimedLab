// src/routes/supplierRoutes.js
const express = require("express");
const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const uploadSupplier = require("../middleware/uploadSupplierMiddleware"); // Add this

const router = express.Router();

router.use(protect);

router.get("/", allowRoles("admin", "stock", "director"), getSuppliers);

// Add uploadSupplier.single('image') to POST and PUT
router.post(
  "/",
  allowRoles("admin", "stock"),
  uploadSupplier.single("image"),
  createSupplier,
);
router.put(
  "/:id",
  allowRoles("admin", "stock"),
  uploadSupplier.single("image"),
  updateSupplier,
);
router.delete("/:id", allowRoles("admin", "stock"), deleteSupplier);

module.exports = router;
