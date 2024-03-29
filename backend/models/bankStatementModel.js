const mongoose = require("mongoose");

const ACCOUNT_NUMBERS = ["Admin", "Manager", "Employee", "Accountant"];

const bankStatementSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  deposits: { type: Number, default: 0 },
  spends: { type: Number, default: 0 },
  statementRemarks: { type: String, default: "" },
  checkNumber: { type: Number },
  statementDetails: { type: String, default: "" },
  statementDate: { type: Date },
  bankAccountNumber: { type: Number, enum: ACCOUNT_NUMBERS, required: true },
});

module.exports = mongoose.model("BankStatement", bankStatementSchema);
