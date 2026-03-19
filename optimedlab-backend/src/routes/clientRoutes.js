const express = require("express");
const {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const uploadClientImages = require("../middleware/uploadClientMiddleware"); // <-- IMPORT ADDED

const router = express.Router();

router.use(protect);

router.get("/", allowRoles("admin", "commercial", "director"), getClients);

// <-- ADD MIDDLEWARE HERE
router.post(
  "/",
  allowRoles("admin", "commercial"),
  uploadClientImages.single("image"),
  createClient,
);

// <-- ADD MIDDLEWARE HERE
router.put(
  "/:id",
  allowRoles("admin", "commercial"),
  uploadClientImages.single("image"),
  updateClient,
);

router.delete("/:id", allowRoles("admin"), deleteClient);

module.exports = router;
