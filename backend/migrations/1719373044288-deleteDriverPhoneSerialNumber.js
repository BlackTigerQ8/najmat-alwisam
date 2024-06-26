const Driver = require("../models/driverModel");
const connectDB = require("../config/db");

/**
 * Make any changes you need to make to the database here
 */
async function up() {
  try {
    await connectDB();
    // Write migration here
    const drivers = await Driver.find({});

    for (let driver of drivers) {
      if (driver.phoneSerialNumber) {
        delete driver.phoneSerialNumber;
      }

      await driver.save();
    }

    console.log("Migration up completed.");
  } catch (error) {
    console.log("Error running migration", error);
    throw error;
  }
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down() {
  await connectDB();
  // Write migration here
  const drivers = await Driver.find({});

  for (let driver of drivers) {
    if (!driver.phoneSerialNumber) {
      driver.phoneSerialNumber = "defaultSerialNumber"; // Set a default value if needed
    }
    if (driver.carType) {
      delete driver.carType;
    }
    await driver.save();
  }

  console.log("Migration down completed.");
}

module.exports = { up, down };
