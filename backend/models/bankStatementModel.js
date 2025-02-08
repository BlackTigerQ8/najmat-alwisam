const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema({
  accountNumber: { type: Number, required: true, unique: true },
  accountName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  addedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const bankStatementSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  deposits: { type: Number, default: 0 },
  spends: { type: Number, default: 0 },
  statementRemarks: { type: String, default: "" },
  checkNumber: { type: Number },
  statementDetails: { type: String, default: "" },
  statementDate: { type: Date },
  bankAccountNumber: {
    type: Number,
    required: true,
    ref: "BankAccount",
  },
  addedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sequence: {
    type: Number,
    default: 1,
  },
});

module.exports = {
  BankStatement: mongoose.model("BankStatement", bankStatementSchema),
  BankAccount: mongoose.model("BankAccount", bankAccountSchema),
};
