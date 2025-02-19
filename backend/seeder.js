const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User } = require("./models/userModel");
const Driver = require("./models/driverModel");
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

const updateDriversPositionsAndBank = async () => {
  try {
    await connectDB(); // Ensure DB connection is established
    console.log("Starting driver updates...");

    // Get all drivers using the destructured Driver model
    const drivers = await Driver.find({});

    if (!drivers || drivers.length === 0) {
      console.log("No drivers found in the database");
      return;
    }

    console.log(`Found ${drivers.length} drivers to update`);

    // Counter for tracking updates
    let updatedCount = 0;

    for (const driver of drivers) {
      try {
        const updates = {
          // Set position based on vehicle type
          position:
            driver.vehicle === "Car" ? "Car Driver" : "Motorcycle Driver",
          // Set bank name to KFH for all drivers
          bankName: "Kuwait Finance House (KFH)",
        };

        // Update the driver
        await Driver.findByIdAndUpdate(driver._id, updates);
        updatedCount++;
        console.log(`Updated driver: ${driver.firstName} ${driver.lastName}`);
      } catch (updateError) {
        console.error(`Error updating driver ${driver._id}:`, updateError);
      }
    }

    console.log(`Successfully updated ${updatedCount} drivers`);
  } catch (error) {
    console.error("Error updating drivers:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

const runSeeder = async () => {
  try {
    await connectDB();
    // Comment/uncomment the function you want to run
    // await createAdmin();
    // await createRandomUsers();
    await updateDriversPositionsAndBank();
  } catch (error) {
    console.error("Seeder error:", error);
  } finally {
    mongoose.connection.close();
  }
};

// createRandomUsers();
// createAdmin();
runSeeder();
