const mongoose = require("mongoose");
const PettyCash = require("./models/pettyCashModel");
const { faker } = require("@faker-js/faker");
const connectDB = require("./config/db.js");

const deleteAllPettyCash = async () => {
  try {
    await connectDB();
    // Delete all Petty Cash
    await PettyCash.deleteMany({});
    console.log("All Petty Cash deleted");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

const createRandomPettyCash = async () => {
  try {
    await connectDB();

    //await deleteAllPettyCash();
    // Find the last sequence number in the database
    const lastPettyCash = await PettyCash.findOne({})
      .sort({ sequenceNumber: -1 })
      .limit(1)
      .exec();
    const roles = ["Accountant", "Employee", "Manager"];
    let lastSequenceNumber = lastPettyCash?.sequenceNumber || 0;
    let lastSerialNumber = lastPettyCash?.serialNumber || 0;

    console.log("lastPettyCash", lastPettyCash);

    if (lastPettyCash) {
      lastSequenceNumber = lastPettyCash.sequenceNumber + 1;
      lastSerialNumber = lastSerialNumber + 1;
    }

    console.log("lastSerialNumber", lastSerialNumber);

    let totalSpends = 0;
    let totalAmountOnWorker = 0;

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
      const serialNumber = lastSerialNumber + 1;

      const newPettyCash = new PettyCash({
        sequenceNumber,
        serialNumber,
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

      lastSerialNumber = serialNumber;
      lastSequenceNumber = sequenceNumber; // Update the last sequence number
    }
    mongoose.connection.close();
    console.log("All Petty Cash created and connection closed");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

createRandomPettyCash();
