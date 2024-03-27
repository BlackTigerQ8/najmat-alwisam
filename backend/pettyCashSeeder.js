const mongoose = require("mongoose");
const PettyCash = require("./models/pettyCashModel");
const { faker } = require("@faker-js/faker");
const connectDB = require("./config/db.js");
const Driver = require("./models/driverModel.js");
const { User } = require("./models/userModel.js");
const SpendType = require("./models/spendTypeModel.js");

const deleteAllPettyCash = async () => {
  try {
    console.log("Before deleting Petty Cash records");
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

    await deleteAllPettyCash();
    // Find the last sequence number in the database
    const lastPettyCash = await PettyCash.findOne({});

    let lastSerialNumber = lastPettyCash?.serialNumber || 0;

    console.log("lastPettyCash", lastPettyCash);

    if (lastPettyCash) {
      lastSequenceNumber = lastPettyCash.sequenceNumber + 1;
      lastSerialNumber = lastSerialNumber + 1;
    }

    const drivers = await Driver.find();
    const spendTypes = await SpendType.find();

    for (let i = 0; i < 10; i++) {
      // Calculate the sequence number based on the last one in the database
      const serialNumber = lastSerialNumber + 1;

      const driverIndex = faker.number.int({ min: 0, max: drivers.length - 1 });
      const driverId = drivers[driverIndex]?._id || drivers[0]?._id;

      const spendTypeIndex = faker.number.int({
        min: 0,
        max: spendTypes.length - 1,
      });

      const spendTypeId = spendTypes[spendTypeIndex]?._id || spendTypes[0]?._id;

      if (!driverId || !spendTypeId) continue;

      const pettyCashRawData = buildPettyCash(serialNumber, 2000, 2000);

      const newPettyCash = new PettyCash({
        ...pettyCashRawData,
        deductedFromDriver: driverId,
        sequenceNumber: serialNumber,
        spendType: spendTypeId,
      });

      console.log("newPettyCash", newPettyCash);

      await newPettyCash.save();

      lastSerialNumber = serialNumber;
    }

    const users = await User.find();
    for (let j = 0; j < 6; j++) {
      // Calculate the sequence number based on the last one in the database
      const serialNumber = lastSerialNumber + 1;

      const userIndex = faker.number.int({ min: 0, max: users.length - 1 });
      const userId = users[userIndex]?._id || users[0]?._id;

      const spendTypeIndex = faker.number.int({
        min: 0,
        max: spendTypes.length - 1,
      });

      const spendTypeId = spendTypes[spendTypeIndex]?._id || spendTypes[0]?._id;

      if (!userId || !spendTypeId) continue;

      const pettyCashRawData = buildPettyCash(serialNumber, 2000, 2000);

      const newPettyCash = new PettyCash({
        ...pettyCashRawData,
        deductedFromUser: userId,
        sequenceNumber: serialNumber,
        spendType: spendTypeId,
      });

      await newPettyCash.save();

      lastSerialNumber = serialNumber;
    }

    for (let k = 0; k < 5; k++) {
      // Calculate the sequence number based on the last one in the database
      const serialNumber = lastSerialNumber + 1;

      const spendTypeIndex = faker.number.int({
        min: 0,
        max: spendTypes.length - 1,
      });

      const spendTypeId = spendTypes[spendTypeIndex]?._id || spendTypes[0]?._id;

      if (!spendTypeId) continue;

      const pettyCashRawData = buildPettyCash(serialNumber, 2000, 2000);

      const newPettyCash = new PettyCash({
        ...pettyCashRawData,
        sequenceNumber: serialNumber,        
        spendType: spendTypeId,
      });

      await newPettyCash.save();

      lastSerialNumber = serialNumber;
    }

    mongoose.connection.close();
    console.log("All Petty Cash created and connection closed");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

function buildPettyCash(serialNumber, currentBalance, previousBalance) {
  const requestApplicant = faker.person.fullName();
  const spendsDate = faker.date.between("2020-01-01", "2024-01-01");
  const requestDate = faker.date.between("2020-01-01", "2024-01-01");
  const spendsReason = faker.finance.transactionDescription();
  const cashAmount = faker.datatype.number({
    min: 5,
    max: 299,
  });

  const spendTypes = ["Car Oil", "Bike Oil", "Office Essentials"];
  const spendType = spendTypes[Math.floor(Math.random() * spendTypes.length)];
  const spendsRemarks = faker.string.sample({ min: 5, max: 10 });

  return {
    serialNumber,
    requestApplicant,
    spendsDate,
    requestDate,
    spendsReason,
    cashAmount,
    spendType,
    spendsRemarks,
    currentBalance,
    previousBalance,
  };
}

createRandomPettyCash();
