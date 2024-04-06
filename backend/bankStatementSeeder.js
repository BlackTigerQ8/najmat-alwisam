const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const connectDB = require("./config/db.js");
const { User } = require("./models/userModel.js");
const BankStatement = require("./models/bankStatementModel.js");

const deleteAllPettyCash = async () => {
  try {
    await connectDB();
    console.log("Before deleting Bank statement records");
    await BankStatement.deleteMany({});
    console.log("All Bank statement deleted");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

deleteAllPettyCash();
