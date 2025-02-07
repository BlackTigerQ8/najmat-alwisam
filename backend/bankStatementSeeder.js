const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const connectDB = require("./config/db.js");
const { User } = require("./models/userModel.js");
const BankStatement = require("./models/bankStatementModel.js");

const updateBankAccountNumbers = async () => {
  try {
    await connectDB();

    // Update records where bankAccountNumber is 7568
    await BankStatement.updateMany(
      { bankAccountNumber: 8657 },
      { bankAccountNumber: 11010718657 }
    );
    console.log("Updated all 7568 accounts to 11010718657");

    // Update records where bankAccountNumber is 1638
    await BankStatement.updateMany(
      { bankAccountNumber: 1638 },
      { bankAccountNumber: 61010108361 }
    );
    console.log("Updated all 1638 accounts to 61010108361");

    console.log("Bank account numbers updated successfully");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error updating bank account numbers:", error);
    mongoose.connection.close();
  }
};

updateBankAccountNumbers();
