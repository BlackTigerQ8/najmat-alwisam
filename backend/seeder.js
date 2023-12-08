const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");
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
      password: "66850080",
      confirmPassword: "66850080",
      role: "Admin",
      passport: "P0000",
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
  for (let i = 0; i < 10; i++) {
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
    const passport = faker.datatype
      .number({ min: 1000000, max: 9999999 })
      .toString();
    const password = "12341234";

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
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
  }

  mongoose.connection.close();
  console.log("All users created and connection closed");
};

createRandomUsers();
createAdmin();
