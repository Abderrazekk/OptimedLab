const express = require("express");
const {
  getVisits,
  createVisit,
  getFormData,
  updateVisit, // <-- IMPORT
  deleteVisit, // <-- IMPORT
} = require("../controllers/visitController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// /api/visits/form-data (must be before /:id)
router.route("/form-data").get(getFormData);

// /api/visits/:id
router
  .route("/:id")
  .put(updateVisit) // <-- ADD
  .delete(deleteVisit); // <-- ADD

// /api/visits
router.route("/").get(getVisits).post(createVisit);

module.exports = router;
