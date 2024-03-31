const SpendType = require("../models/spendTypeModel");

// @desc    Get all PettyCash
// @route   GET /api/petty-cash
// @access  Private/Accountant
const getAllSpendTypes = async (req, res) => {
  try {
    const spendTypes = await SpendType.find();

    res.status(200).json({
      status: "Success",
      data: {
        spendTypes,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const createSpendType = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name)
      return res.status(400).json({
        message: "Name is a required filed",
      });

    const spendType = new SpendType({
      name,
    });

    await spendType.save();

    return res.status(201).json({
      status: "Success",
      data: {
        spendType,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

module.exports = {
  getAllSpendTypes,
  createSpendType,
};
