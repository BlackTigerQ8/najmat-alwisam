const Driver = require("../models/driverModel");
const connectDB = require("../config/db");
const { faker } = require("@faker-js/faker");

/**
 * Make any changes you need to make to the database here
 */
async function up() {
  try {
    await connectDB();
    // Write migration here
    const drivers = await Driver.find({});

    for (let driver of drivers) {
      if (driver.phoneContractNumber) {
        delete driver.phoneContractNumber;
      }

      if (!driver.employeeCompanyNumber)
        driver.employeeCompanyNumber = faker.datatype.number({
          min: 1000000000,
          max: 9999999999,
        });

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
    if (!driver.phoneContractNumber) {
      driver.phoneContractNumber = "defaultPhoneContactNumber"; // Set a default value if needed
    }
    if (driver.employeeCompanyNumber) {
      delete driver.employeeCompanyNumber;
    }
    await driver.save();
  }

  console.log("Migration down completed.");
}

module.exports = { up, down };
