const mongoose = require("mongoose");

const invoiceStatus = [
  "visibleToAll",
  "pendingManagerReview",
  "pendingAdminReview",
  "approved",
  "managerRejected",
  "adminRejected",
  "archived",
  "overridden",
  "visibleToAllArchived",
];

const driverInvoiceSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Driver",
  },
  invoiceDate: { type: Date },
  mainOrder: { type: Number, default: 0 },
  additionalOrder: { type: Number, default: 0 },
  hour: { type: Number, default: 0 },
  cash: { type: Number, default: 0 },
  additionalSalary: { type: Number, default: 0 },
  deductionReason: { type: String, default: "" },
  talabatDeductionAmount: { type: Number, default: 0 },
  companyDeductionAmount: { type: Number, default: 0 },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  status: {
    type: String,
    enum: invoiceStatus,
    default: "pendingManagerReview",
  },
  remarks: { type: String },
  archivedAt: {
    type: Date,
  },
  archivedBy: {
    ref: "User",
    type: mongoose.Schema.Types.ObjectId,
  },
  file: {
    type: String,
  },
});

module.exports = mongoose.model("DriverInvoice", driverInvoiceSchema);
