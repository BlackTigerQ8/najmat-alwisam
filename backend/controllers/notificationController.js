const Notification = require("../models/notificationModel");
const ReadNotification = require("../models/readNotificationModel");

const getAllNotifications = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    const notifications = await Notification.find({
      role: userRole,
      status: "visible",
    }).sort({ createdAt: -1 });

    // Fetch read notifications for the user
    const readNotifications = await ReadNotification.find({ userId });

    const unreadNotifications = notifications.filter((notification) => {
      return !readNotifications.some((readNotification) =>
        readNotification.notificationId.equals(notification._id)
      );
    });

    return res
      .status(200)
      .json({ data: { notifications: unreadNotifications } });
  } catch (error) {
    console.log("Get all notifications", error);
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const createNotification = async (req, res) => {
  try {
    const newNotification = await Notification.create({
      ...req.body,
    });

    res.status(201).json({
      status: "Success",
      data: {
        notification: newNotification,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

module.exports = {
  getAllNotifications,
  createNotification,
};
