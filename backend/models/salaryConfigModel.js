const mongoose = require("mongoose");

const salaryRuleSchema = new mongoose.Schema({
  minOrders: Number,
  maxOrders: Number,
  multiplier: Number,
  fixedAmount: Number,
});

const salaryConfigSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    enum: ["Car", "Bike"],
    required: true,
  },
  rules: [salaryRuleSchema],
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SalaryConfig", salaryConfigSchema);
