const mongoose = require("mongoose");

const USER_ROLES = ["Admin", "Manager", "Employee", "Accountant"];

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receivers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  message: { type: String, required: true },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = {
  Message: mongoose.model("Message", messageSchema),
  USER_ROLES,
};
