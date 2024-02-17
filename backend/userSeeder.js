const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User } = require("./models/userModel");
const { faker } = require("@faker-js/faker");
const connectDB = require("./config/db.js");

connectDB();

const createRandomUsers = async () => {
  try {
    // Find the last sequence number in the database
    const lastUser = await User.findOne(
      {},
      {},
      { sort: { sequenceNumber: -1 } }
    );
    let lastSequenceNumber = 0;

    if (lastUser) {
      lastSequenceNumber = lastUser.sequenceNumber;
    }

    for (let i = 0; i < 10; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const roles = ["Accountant", "Employee", "Manager"];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const email = faker.internet.email({ firstName, lastName });
      const phone = faker.datatype.number({ min: 10000000, max: 99999999 });
      const identification = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const passport = faker.datatype
        .number({ min: 1000000, max: 9999999 })
        .toString();
      const password = "12341234";

      const hashedPassword = await bcrypt.hash(password, 12);

      // Calculate the sequence number based on the last one in the database
      const sequenceNumber = lastSequenceNumber + 1;

      const newUser = new User({
        sequenceNumber,
        firstName,
        lastName,
        email,
        phone,
        identification,
        role,
        passport,
        password: hashedPassword,
        confirmPassword: hashedPassword,
      });

      await newUser.save();
      console.log(`User ${i + 1}: ${firstName} ${lastName} created`);
      lastSequenceNumber = sequenceNumber; // Update the last sequence number
    }
    mongoose.connection.close();
    console.log("All users created and connection closed");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

const deleteAllUsers = async () => {
  try {
    // Delete all users
    await User.deleteMany({});
    console.log("All users deleted");

    mongoose.connection.close();
    console.log("Connection closed");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

createRandomUsers();
// deleteAllUsers();
