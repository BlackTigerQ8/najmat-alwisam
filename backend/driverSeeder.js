const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Driver = require("./models/driverModel");
const { faker } = require("@faker-js/faker");
const connectDB = require("./config/db.js");

connectDB();

const createRandomDrivers = async () => {
  try {
    // Find the last sequence number in the database
    const lastDriver = await Driver.findOne(
      {},
      {},
      { sort: { sequenceNumber: -1 } }
    );
    let lastSequenceNumber = 0;

    if (lastDriver) {
      lastSequenceNumber = lastDriver.sequenceNumber;
    }
    for (let i = 0; i < 10; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const phone = faker.datatype.number({ min: 10000000, max: 99999999 });
      const email = faker.internet.email({ firstName, lastName });
      const idNumber = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const idExpiryDate = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const passportNumber = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const passportExpiryDate = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const visa = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const contractNumber = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const carInsurance = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const carPlateNumber = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const driverLicense = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const workPass = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const healthInsuranceDate = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const healthInsuranceExpiryDate = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const phoneSerialNumber = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const phoneContractNumber = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const iban = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const vehicles = ["Car", "Bike"];
      const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
      const contractTypes = ["Talabat", "Others"];
      const contractType =
        contractTypes[Math.floor(Math.random() * contractTypes.length)];
      const referenceNumber = faker.datatype.number({
        min: 10000000,
        max: 99999999,
      });
      const order = Driver.order;
      const hour = Driver.hour;
      const cost = Driver.cost;
      const mainSalary = Driver.mainSalary;
      const extraSalary = Driver.extraSalary;
      const deductionReason = Driver.deductionReason;
      const deductionAmount = Driver.deductionAmount;

      // Calculate the sequence number based on the last one in the database
      const sequenceNumber = lastSequenceNumber + 1;

      const newDriver = new Driver({
        sequenceNumber,
        firstName,
        lastName,
        email,
        phone,
        idNumber,
        idExpiryDate,
        passportNumber,
        passportExpiryDate,
        visa,
        contractExpiryDate,
        carInsurance,
        carPlateNumber,
        driverLicense,
        workPass,
        healthInsuranceDate,
        healthInsuranceExpiryDate,
        phoneSerialNumber,
        phoneContractNumber,
        iban,
        vehicle,
        contractType,
        referenceNumber,
        mainSalary,
      });

      await newDriver.save();
      console.log(`Driver ${i + 1}: ${firstName} ${lastName} created`);
      lastSequenceNumber = sequenceNumber; // Update the last sequence number
    }
    mongoose.connection.close();
    console.log("All drivers created and connection closed");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

const deleteAllDrivers = async () => {
  try {
    // Delete all users
    await Driver.deleteMany({});
    console.log("All users deleted");

    mongoose.connection.close();
    console.log("Connection closed");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

// createRandomDrivers();
deleteAllDrivers();
