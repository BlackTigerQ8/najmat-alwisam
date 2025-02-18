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
];

const employeeInvoice = new mongoose.Schema({
  invoiceDate: { type: Date },
  deductionDate: { type: Date },
  additionalSalary: { type: Number, default: 0 },
  deductionReason: { type: String, default: "" },
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
  invoiceAddedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  file: {
    type: String,
  },
});

module.exports = mongoose.model("EmployeeInvoice", employeeInvoice);
