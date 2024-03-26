const mongoose = require("mongoose");

const spendTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Spend type name is required"],
  },
});

module.exports = mongoose.model("SpendType", spendTypeSchema);
