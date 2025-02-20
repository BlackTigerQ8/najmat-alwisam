const SalaryConfig = require("../models/salaryConfigModel");

// const defaultCarRules = [
//   { minOrders: 0, maxOrders: 419, multiplier: 0.3, fixedAmount: 0 },
//   { minOrders: 420, maxOrders: 449, multiplier: 0, fixedAmount: 140 },
//   { minOrders: 450, maxOrders: 499, multiplier: 0.45, fixedAmount: 0 },
//   { minOrders: 500, maxOrders: 500, multiplier: 0.45, fixedAmount: 0 },
//   { minOrders: 501, maxOrders: 599, multiplier: 0.5, fixedAmount: 0 },
//   { minOrders: 600, maxOrders: Infinity, multiplier: 0.5, fixedAmount: 0 },
// ];

// const defaultBikeRules = [
//   { minOrders: 0, maxOrders: 200, multiplier: 0, fixedAmount: 50 },
//   { minOrders: 201, maxOrders: 300, multiplier: 0, fixedAmount: 100 },
//   { minOrders: 301, maxOrders: 349, multiplier: 0, fixedAmount: 150 },
//   { minOrders: 350, maxOrders: 419, multiplier: 0.45, fixedAmount: 0 },
//   { minOrders: 420, maxOrders: Infinity, multiplier: 0.5, fixedAmount: 0 },
// ];

// Get all salary configurations
const getSalaryConfigs = async (req, res) => {
  try {
    const configs = await SalaryConfig.find();

    res.status(200).json({
      status: "Success",
      data: configs,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// Get salary config by vehicle type
const getSalaryConfigByVehicle = async (req, res) => {
  try {
    const config = await SalaryConfig.findOne({
      vehicleType: req.params.vehicleType,
    });

    if (!config) {
      return res.status(404).json({
        status: "Error",
        message: "No configuration found for this vehicle type",
      });
    }

    res.status(200).json({
      status: "Success",
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// Create new salary configuration
const createSalaryConfig = async (req, res) => {
  try {
    const newConfig = await SalaryConfig.create({
      ...req.body,
      lastUpdatedBy: req.user._id,
    });

    res.status(201).json({
      status: "Success",
      data: newConfig,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// Update salary configuration
const updateSalaryConfig = async (req, res) => {
  try {
    const config = await SalaryConfig.findOneAndUpdate(
      { vehicleType: req.params.vehicleType },
      {
        rules: req.body.rules,
        lastUpdatedBy: req.user._id,
        lastUpdatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!config) {
      return res.status(404).json({
        status: "Error",
        message: "No configuration found for this vehicle type",
      });
    }

    res.status(200).json({
      status: "Success",
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const deleteSalaryConfig = async (req, res) => {
  try {
    const config = await SalaryConfig.findOneAndDelete({
      vehicleType: req.params.vehicleType,
    });

    if (!config) {
      return res.status(404).json({
        status: "Error",
        message: "No configuration found for this vehicle type",
      });
    }

    res.status(200).json({
      status: "Success",
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

module.exports = {
  getSalaryConfigs,
  getSalaryConfigByVehicle,
  createSalaryConfig,
  updateSalaryConfig,
  deleteSalaryConfig,
};
