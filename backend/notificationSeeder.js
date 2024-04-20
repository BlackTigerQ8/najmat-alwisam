const mongoose = require("mongoose");
const connectDB = require("./config/db.js");
const Notification = require("./models/notificationModel.js");

const deleteNotifications = async () => {
  try {
    await connectDB();
    console.log("Before deleting notifications records");
    await Notification.deleteMany({});
    console.log("All notifications deleted");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

deleteNotifications().then(() => console.log("notifications deleted"));
