const express = require("express");
const {
  getVisits,
  createVisit,
  getFormData,
} = require("../controllers/visitController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // All authenticated users can access

// IMPORTANT: /form-data must come BEFORE / to prevent it being treated as an ID
router.route("/form-data").get(getFormData);

router.route("/").get(getVisits).post(createVisit);

module.exports = router;
