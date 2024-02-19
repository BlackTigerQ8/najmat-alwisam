const express = require("express");
const {
  getAllNotifications,
  createNotification,
  markAllNotificationsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getAllNotifications)
  .post(protect, createNotification);

router.route("/mark-read").post(protect, markAllNotificationsRead);

module.exports = router;
