const express = require("express");
const {
  getAllNotifications,
  createNotification,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getAllNotifications)
  .post(protect, createNotification);

module.exports = router;
