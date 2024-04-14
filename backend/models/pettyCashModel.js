// pettyCashModel.js

const mongoose = require("mongoose");

const status = ["pending", "approved", "rejected", "archived"];

const pettyCashSchema = new mongoose.Schema({
  serialNumber: {
    type: Number,
    required: [true, "Serial number is required"],
  },
  sequence: {
    type: Number,
  },
  requestApplicant: {
    type: String,
    required: [true, "Request applicant is required"],
  },
  requestDate: {
    type: Date,
    required: [true, "Request date is required"],
  },
  spendsDate: {
    type: Date,
    required: [true, "Spends date is required"],
  },
  spendsReason: {
    type: String,
    required: [true, "Spends reason is required"],
  },
  cashAmount: {
    type: Number,
    required: [true, "Cash amount is required"],
    default: 0,
  },
  spendType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SpendType",
    required: [true, "Spend type is required"],
  },
  spendsRemarks: {
    type: String,
  },
  deductedFromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  deductedFromDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
  },
  previousBalance: {
    type: Number,
    default: 0,
  },
  currentBalance: {
    type: Number,
  },
  status: {
    type: String,
    enum: status,
    default: "pending",
  },
  addedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("PettyCash", pettyCashSchema);
