const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User } = require("./models/userModel");
const { faker } = require("@faker-js/faker");
const connectDB = require("./config/db.js");

connectDB();

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const admin = await User.findOne({ role: "Admin" });
    if (admin) {
      console.log("Admin account already exists");
      return;
    }

    // Create new admin user
    const newAdmin = new User({
      firstName: "Abdullah",
      lastName: "Alenezi",
      email: "admin@gmail.com",
      password: "112233",
      confirmPassword: "112233",
      role: "Admin",
      passport: "P0000",
      contractExpiryDate: "2/23/2024",
      visa: "000",
      phone: 66850080,
      identification: "295072100108",
    });

    await newAdmin.save();
    console.log("Admin account created successfully");
  } catch (error) {
    console.error("Error creating admin account", error);
  } finally {
    mongoose.connection.close();
  }
};

const createRandomUsers = async () => {
  try {
    // Find the last sequence number in the database
    const lastUser = await User.findOne(
      {},
      {},
      { sort: { sequenceNumber: -1 } }
    );
    let lastSequenceNumber = 1;

    if (lastUser) {
      lastSequenceNumber = lastUser.sequenceNumber;
    }

    for (let i = 0; i < 3; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const roles = ["Accountant", "Employee"];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const email = faker.internet.email({ firstName, lastName });
      const phone = faker.datatype.number({ min: 10000000, max: 99999999 });
      const identification = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const visa = faker.datatype.number({
        min: 1000000000,
        max: 9999999999,
      });
      const contractExpiryDate = faker.datatype.datetime({
        min: 1000000000,
        max: 9999999999,
      });
      const passport = faker.datatype
        .number({ min: 1000000, max: 9999999 })
        .toString();
      const password = "123123";
      // const file = User.file;

      const hashedPassword = await bcrypt.hash(password, 12);
      const sequenceNumber = lastSequenceNumber + 1;

      const newUser = new User({
        sequenceNumber,
        firstName,
        lastName,
        email,
        phone,
        identification,
        visa,
        contractExpiryDate,
        role,
        passport,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        // file,
      });

      await newUser.save();
      console.log(`User ${i + 1}: ${firstName} ${lastName} created`);
      lastSequenceNumber = sequenceNumber;
    }

    mongoose.connection.close();
    console.log("All users created and connection closed");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

// createRandomUsers();
createAdmin();
