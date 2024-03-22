const mongoose = require("mongoose");

const bankStatementSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  deposits: { type: Number, default: 0 },
  spends: { type: Number, default: 0 },
  statementMonth: { type: String, default: "" },
  checkNumber: { type: Number },
  statementDetails: { type: String, default: "" },
  statementDate: { type: Date },
});

module.exports = mongoose.model("BankStatement", bankStatementSchema);
