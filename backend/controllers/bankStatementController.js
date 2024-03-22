const BankStatement = require("../models/bankStatementModel");

// @desc    Get all BankStatement
// @route   GET /api/bank-statement
// @access  Private/Accountant
const getAllBankStatement = async (req, res) => {
  try {
    const bankStatement = await BankStatement.find();
    res.status(200).json({
      status: "Success",
      data: {
        bankStatement,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Update bank statement
// @route   PATCH /api/bank-statement/:id
// @access  Private/Accountant
const updateBankStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const bankStatement = await BankStatement.findByIdAndUpdate(
      id,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bankStatement) {
      return res.status(404).json({
        status: "Error",
        message: "Bank statement not found",
      });
    }

    res.status(200).json({
      status: "Success",
      data: {
        bankStatement,
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
  getAllBankStatement,
  updateBankStatement,
};
