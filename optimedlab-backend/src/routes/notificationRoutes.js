const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

router.use(protect);

router.route("/").get(getMyNotifications);
router.patch("/read-all", markAllAsRead);
router.route("/:id").delete(deleteNotification);
router.patch("/:id/read", markAsRead);

module.exports = router;