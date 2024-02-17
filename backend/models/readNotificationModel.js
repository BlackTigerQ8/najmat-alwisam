const mongoose = require("mongoose");

const readNotificationSchema = new mongoose.Schema({
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  readAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("readNotification", readNotificationSchema);
