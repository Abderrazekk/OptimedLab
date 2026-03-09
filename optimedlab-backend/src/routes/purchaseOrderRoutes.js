const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  receivePurchaseOrder,
} = require("../controllers/purchaseOrderController");

const router = express.Router();
router.use(protect);

router.get("/", allowRoles("admin", "stock", "director"), getPurchaseOrders);
router.get(
  "/:id",
  allowRoles("admin", "stock", "director"),
  getPurchaseOrderById,
);
router.post("/", allowRoles("admin", "stock"), createPurchaseOrder);
router.put("/:id", allowRoles("admin", "stock"), updatePurchaseOrder);
router.delete("/:id", allowRoles("admin", "stock"), deletePurchaseOrder);
router.put("/:id/receive", allowRoles("admin", "stock"), receivePurchaseOrder);

module.exports = router;
