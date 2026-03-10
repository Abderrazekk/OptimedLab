const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleBanUser, // ADD THIS IMPORT
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(allowRoles("admin"));

router.route("/").get(getUsers).post(createUser);

router.route("/:id").put(updateUser).delete(deleteUser);

// ADD THE NEW BAN ROUTE
router.route("/:id/ban").put(toggleBanUser);

module.exports = router;
