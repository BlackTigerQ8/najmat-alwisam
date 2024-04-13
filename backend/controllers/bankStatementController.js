const BankStatement = require("../models/bankStatementModel");

// @desc    Get all BankStatement
// @route   GET /api/bank-statement
// @access  Private/Accountant
const getAllBankStatement = async (req, res) => {
  try {
    const bankStatement = await BankStatement.find().sort([
      ["bankAccountNumber", 1], // Sort by bankAccountNumber in ascending order
      ["sequence", 1], // Then sort by sequence in descending order
    ]);
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

const searchBankStatementRecords = async (req, res) => {
  try {
    const { bankAccountNumber, startDate, endDate } = req.body;

    if (!startDate || !endDate)
      throw new Error("Start date or end date is missing");

    const bankStatement = await BankStatement.find({
      bankAccountNumber,
      statementDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort([
      ["bankAccountNumber", 1], // Sort by bankAccountNumber in ascending order
      ["sequence", -1], // Then sort by sequence in descending order
    ]);
    res.status(200).json({
      status: "Success",
      data: {
        results: bankStatement,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const createBankStatementRecord = async (req, res) => {
  try {
    const {
      statementDate,
      deposits = 0,
      spends = 0,
      balance = 0,
      statementRemarks = "",
      checkNumber = "",
      statementDetails = "",
      bankAccountNumber,
    } = req.body;

    if (!statementDate) throw new Error("Statement date is required");

    const lastBankStatementRecord = await BankStatement.findOne({
      bankAccountNumber,
    })
      .sort({
        sequence: -1,
      })
      .limit(1);

    if (!lastBankStatementRecord) {
      if (!balance)
        throw new Error(
          "Does not have starting balance for first bank statement record"
        );

      const bankStatementRecord = new BankStatement({
        statementDate,
        deposits,
        spends,
        statementRemarks,
        checkNumber,
        statementDetails,
        bankAccountNumber,
        balance,
        addedByUser: req.user.id,
      });

      await bankStatementRecord.save();

      return res.status(201).json({
        status: "Success",
        data: {
          bankStatement: bankStatementRecord,
        },
      });
    }

    const newBankStatementRecord = new BankStatement({
      statementDate,
      deposits,
      spends,
      statementRemarks,
      checkNumber,
      statementDetails,
      bankAccountNumber,
      balance: lastBankStatementRecord.balance - spends + deposits,
      addedByUser: req.user.id,
      sequence: lastBankStatementRecord.sequence + 1,
    });

    await newBankStatementRecord.save();

    return res.status(201).json({
      status: "Success",
      data: {
        bankStatement: newBankStatementRecord,
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
  createBankStatementRecord,
  searchBankStatementRecords,
};
