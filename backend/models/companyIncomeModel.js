const mongoose = require("mongoose");

const TYPE = ["Income", "Refund"];
const companyIncomeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: TYPE,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  bikeIncome: {
    type: Number,
  },
  carIncome: {
    type: Number,
  },
  otherIncome: {
    type: Number,
  },
  refundCompany: {
    type: String,
  },
  refundAmount: {
    type: Number,
  },
  addedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CompanyIncome", companyIncomeSchema);
