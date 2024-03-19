// pettyCashModel.js

const mongoose = require("mongoose");

const pettyCashSchema = new mongoose.Schema({
  serialNumber: {
    type: Number,
    unique: true,
  },
  requestApplicant: {
    type: String,
    unique: true,
  },
  requestDate: {
    type: Date,
    unique: true,
  },
  sequenceNumber: {
    type: Number,
    unique: true,
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
  deductedFrom: {
    type: String,
  },
  totalSpends: {
    type: Number,
    default: 501,
  },
  totalAmountOnWorker: {
    type: Number,
    default: 100,
  },
  totalAmountOnCompany: {
    type: Number,
  },
  previousBalance: {
    type: Number,
  },
  currentBalance: {
    type: Number,
  },
});

// Pre-save middleware to generate and assign the sequence number
pettyCashSchema.pre("save", async function (next) {
  try {
    if (!this.sequenceNumber) {
      // Find the last petty cash entry in the database
      const lastPettyCash = await this.constructor.findOne(
        {},
        {},
        { sort: { sequenceNumber: -1 } }
      );

      let lastSequenceNumber = 0;
      if (lastPettyCash) {
        lastSequenceNumber = lastPettyCash.sequenceNumber;
      }

      // Calculate the sequence number based on the last one in the database
      this.sequenceNumber = lastSequenceNumber + 1;
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("PettyCash", pettyCashSchema);
