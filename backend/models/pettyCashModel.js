// pettyCashModel.js

const mongoose = require("mongoose");

const pettyCashSchema = new mongoose.Schema({
  serialNumber: {
    type: Number,
    required: [true, "Serial number is required"],
  },
  sequenceNumber: {
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
    type: String,
    required: [true, "Spends type is required"],
  },
  spendsRemarks: {
    type: String,
    required: [true, "Spends remarks is required"],
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
  },
  currentBalance: {
    type: Number,
  },
});

module.exports = mongoose.model("PettyCash", pettyCashSchema);
