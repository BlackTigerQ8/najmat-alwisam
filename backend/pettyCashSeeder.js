const mongoose = require("mongoose");
const { PettyCash } = require("./models/pettyCashModel");
const { faker } = require("@faker-js/faker");
const connectDB = require("./config/db.js");

connectDB();

const createRandomPettyCash = async () => {
  try {
    // Find the last sequence number in the database
    const lastPettyCash = await PettyCash.findOne(
      {},
      {},
      { sort: { sequenceNumber: -1 } }
    );
    let lastSequenceNumber = 0;

    if (lastPettyCash) {
      lastSequenceNumber = lastPettyCash.sequenceNumber;
    }

    let totalSpends = 0;

    for (let i = 0; i < 10; i++) {
      const spendsDate = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const spendTypes = ["Car Oil", "Bike Oil", "Office Essentials"];
      const spendType = spendTypes[Math.floor(Math.random() * roles.length)];
      const spendsReason = faker.datatype.string("Test...");
      const cashAmount = faker.datatype.number({
        min: 5,
        max: 299,
      });
      const spendsRemarks = faker.datatype.string("Test...");
      const deductedFroms = ["Ali", "Khaled", "", "Abdullah"];
      const deductedFrom =
        deductedFroms[Math.floor(Math.random() * roles.length)];

      // Add the cashAmount to totalSpends
      totalSpends += cashAmount;

      // Add cashAmount to totalAmountOnWorker if deductedFrom is not an empty string
      if (deductedFrom) {
        totalAmountOnWorker += cashAmount;
      }

      // Calculate totalAmountOnCompany
      totalAmountOnCompany = totalSpends - totalAmountOnWorker;

      previousBalance = 662.919;
      currentBalance = previousBalance - totalSpends;

      // Calculate the sequence number based on the last one in the database
      const sequenceNumber = lastSequenceNumber + 1;

      const newPettyCash = new PettyCash({
        sequenceNumber,
        spendsDate,
        spendsReason,
        cashAmount,
        spendType,
        spendsRemarks,
        deductedFrom,
        totalSpends,
        totalAmountOnWorker,
        totalAmountOnCompany,
        previousBalance,
        currentBalance,
      });

      await newPettyCash.save();
      console.log(`PettyCash ${i + 1}: ${firstName} ${lastName} created`);
      lastSequenceNumber = sequenceNumber; // Update the last sequence number
    }
    mongoose.connection.close();
    console.log("All Petty Cash created and connection closed");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

const deleteAllPettyCash = async () => {
  try {
    // Delete all Petty Cash
    await User.deleteMany({});
    console.log("All Petty Cash deleted");

    mongoose.connection.close();
    console.log("Connection closed");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

createRandomPettyCash();
// deleteAllPettyCash();
