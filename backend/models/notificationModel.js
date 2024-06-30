const mongoose = require("mongoose");
const { USER_ROLES } = require("./userModel");

// Driver expiry => Admin, Employee and Manager,
// Deduction success => Accountant
// Deduction failure => Sender

const NOTIFICATION_TYPE = [
  "Driver_Deduction",
  "Driver_Documents_Expiry",
  "Employee_Deduction",
  "New_Message",
  "Driver_Status_Change",
];

const notificationSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
  },
  forUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  heading: { type: String },
  message: { type: String },
  additionalDetails: { type: Object },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["visible", "fixed", "cancelled", "archived"],
    default: "visible",
  },
  role: {
    type: [String],
    enum: USER_ROLES,
  },
  notification_type: {
    type: String,
    enum: NOTIFICATION_TYPE,
    required: true,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
