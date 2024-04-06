const mongoose = require("mongoose");

const bankStatementSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  deposits: { type: Number, default: 0 },
  spends: { type: Number, default: 0 },
  statementRemarks: { type: String, default: "" },
  checkNumber: { type: Number },
  statementDetails: { type: String, default: "" },
  statementDate: { type: Date },
  bankAccountNumber: { type: Number, required: true },
  addedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sequence: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("BankStatement", bankStatementSchema);
