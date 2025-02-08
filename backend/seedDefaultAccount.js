const mongoose = require("mongoose");
const { BankAccount } = require("./models/bankStatementModel");
require("dotenv").config();

const defaultAccounts = [
  {
    accountNumber: process.env.EXPENSES_ACCOUNT_NUMBER,
    accountName: "expensesAccount",
  },
  {
    accountNumber: process.env.PROFITS_ACCOUNT_NUMBER,
    accountName: "profitsAccount",
  },
];

const seedDefaultAccounts = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("Connected to MongoDB");

    for (const account of defaultAccounts) {
      // Check if account already exists
      const existingAccount = await BankAccount.findOne({
        accountNumber: account.accountNumber,
      });

      if (!existingAccount) {
        await BankAccount.create(account);
        console.log(`Created account: ${account.accountName}`);
      } else {
        console.log(`Account ${account.accountName} already exists`);
      }
    }

    console.log("Default accounts seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding default accounts:", error);
    process.exit(1);
  }
};

seedDefaultAccounts();
