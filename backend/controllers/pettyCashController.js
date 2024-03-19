const PettyCash = require("../models/pettyCashModel");

// @desc    Get all PettyCash
// @route   GET /api/petty-cash
// @access  Private/Accountant
const getAllPettyCash = async (req, res) => {
  try {
    const pettyCash = await PettyCash.find();
    res.status(200).json({
      status: "Success",
      data: {
        pettyCash,
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
  getAllPettyCash,
};
