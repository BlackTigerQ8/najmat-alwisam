const mongoose = require("mongoose");
const SalaryConfig = require("./models/salaryConfigModel");
require("dotenv").config();

const defaultCarRules = [
  { minOrders: 0, maxOrders: 419, multiplier: 0.3, fixedAmount: 0 },
  { minOrders: 420, maxOrders: 449, multiplier: 0, fixedAmount: 140 },
  { minOrders: 450, maxOrders: 499, multiplier: 0.45, fixedAmount: 0 },
  { minOrders: 500, maxOrders: 500, multiplier: 0.45, fixedAmount: 0 },
  { minOrders: 501, maxOrders: 599, multiplier: 0.5, fixedAmount: 0 },
  { minOrders: 600, maxOrders: Infinity, multiplier: 0.5, fixedAmount: 0 },
];

const defaultBikeRules = [
  { minOrders: 0, maxOrders: 200, multiplier: 0, fixedAmount: 50 },
  { minOrders: 201, maxOrders: 300, multiplier: 0, fixedAmount: 100 },
  { minOrders: 301, maxOrders: 349, multiplier: 0, fixedAmount: 150 },
  { minOrders: 350, maxOrders: 419, multiplier: 0.45, fixedAmount: 0 },
  { minOrders: 420, maxOrders: Infinity, multiplier: 0.5, fixedAmount: 0 },
];

const initializeRules = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("Connected to database");

    // Clear existing configurations
    await SalaryConfig.deleteMany({});

    // Create default configurations
    await SalaryConfig.create([
      {
        vehicleType: "Car",
        rules: defaultCarRules,
        lastUpdatedBy: "670b643d117efee828fa715b",
      },
      {
        vehicleType: "Bike",
        rules: defaultBikeRules,
        lastUpdatedBy: "670b643d117efee828fa715b",
      },
    ]);

    console.log("Default salary rules initialized successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing rules:", error);
    process.exit(1);
  }
};

initializeRules();
