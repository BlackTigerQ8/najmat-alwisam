const Notification = require("../models/notificationModel");
const ReadNotification = require("../models/readNotificationModel");

const getAllNotifications = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    const notifications = await fetchVisibleNotifications({ userRole, userId });

    const unreadNotifications = await fetchUnreadNotifications({
      userRole,
      userId,
    });

    return res.status(200).json({
      data: {
        notifications,
        unreadNotificationsCount: unreadNotifications.length,
      },
    });
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

const markAllNotificationsRead = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    const unreadNotifications = await fetchUnreadNotifications({
      userRole,
      userId,
    });

    const readNotifications = unreadNotifications.map((notification) => ({
      notificationId: notification._id,
      userId: userId,
      readAt: new Date(),
    }));

    if (!unreadNotifications.length) {
      return res.status(200).json({
        status: "Success",
        message: "There are no unread notifications",
      });
    }

    await ReadNotification.insertMany(readNotifications);

    return res.status(200).json({
      status: "Success",
      message: "All notifications marked as read successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

async function fetchVisibleNotifications({ userRole, userId }) {
  return await Notification.find({
    $or: [{ role: userRole }, { forUserId: userId }],
    status: "visible",
  }).sort({ createdAt: -1 });
}

async function fetchUnreadNotifications({ userRole, userId }) {
  const notifications = await fetchVisibleNotifications({ userRole, userId });

  // Fetch read notifications for the user
  const readNotifications = await ReadNotification.find({ userId });

  return notifications.filter((notification) => {
    return !readNotifications.some((readNotification) =>
      readNotification.notificationId.equals(notification._id)
    );
  });
}

module.exports = {
  getAllNotifications,
  createNotification,
  markAllNotificationsRead,
};
