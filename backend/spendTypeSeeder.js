const mongoose = require("mongoose");
const connectDB = require("./config/db.js");
const SpendType = require("./models/spendTypeModel.js");

const spendTypesData = ["Car Oil", "Bike Oil", "Office Essentials"];

const deleteAllSpendTypes = async () => {
  try {
    console.log("Before deleting Spend type records");
    await SpendType.deleteMany({});
    console.log("All Spend types deleted");
  } catch (error) {
    console.error(error);
  }
};

const seedSpendTypes = async () => {
  try {
    await connectDB();

    await deleteAllSpendTypes();

    const data = await SpendType.find({});

    console.log("Already inserted data", data);

    const spendTypes = await SpendType.insertMany(
      spendTypesData.map((name) => ({ name }))
    );

    console.log("Spend types seeded:", spendTypes);

    mongoose.connection.close();
  } catch (error) {
    console.error("Error while seeding", error);
    mongoose.connection.close();
  }
};

seedSpendTypes();
