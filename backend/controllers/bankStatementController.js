const { BankStatement, BankAccount } = require("../models/bankStatementModel");

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

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "Error",
        message: "Start date and end date are required",
      });
    }

    // Create date objects for range query
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    const query = {
      bankAccountNumber,
      statementDate: {
        $gte: startDateTime,
        $lte: endDateTime,
      },
    };

    const bankStatement = await BankStatement.find(query).sort({
      statementDate: 1,
    });

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

const fetchCurrentYearBankStatement = async (req, res) => {
  const currentDate = new Date();

  // Get the first day of the current year
  const firstDayOffYear = new Date(currentDate.getFullYear(), 0, 1);

  // Get the first day of the next year
  const firstDayOffNextYear = new Date(currentDate.getFullYear() + 1, 0, 1);

  const pettyCash = await BankStatement.find({
    statementDate: {
      $gte: firstDayOffYear,
      $lt: firstDayOffNextYear,
    },
  });

  res.status(200).json({
    status: "Success",
    data: {
      pettyCash,
    },
  });
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

// @desc    Delete bank statement
// @route   DELETE /api/bank-statement/:id
// @access  Private/Accountant
const deleteBankStatement = async (req, res) => {
  try {
    const { id } = req.params;

    const bankStatement = await BankStatement.findByIdAndDelete(id);

    if (!bankStatement) {
      return res.status(404).json({
        status: "Error",
        message: "Bank statement not found",
      });
    }

    res.status(200).json({
      status: "Success",
      data: {
        id,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const createBankAccount = async (req, res) => {
  try {
    const { accountNumber, accountName } = req.body;

    // Check if account number already exists
    const existingAccount = await BankAccount.findOne({ accountNumber });
    if (existingAccount) {
      return res.status(400).json({
        status: "Error",
        message: "Account number already exists",
      });
    }

    // Check if account name already exists (case insensitive)
    const existingAccountName = await BankAccount.findOne({
      accountName: { $regex: new RegExp(`^${accountName}$`, "i") },
    });
    if (existingAccountName) {
      return res.status(400).json({
        status: "Error",
        message: "Account name already exists",
      });
    }

    const newAccount = await BankAccount.create({
      accountNumber,
      accountName,
      addedByUser: req.user.id,
    });

    res.status(201).json({
      status: "Success",
      data: {
        bankAccount: newAccount,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const getAllBankAccounts = async (req, res) => {
  try {
    const bankAccounts = await BankAccount.find().sort({ accountNumber: 1 });

    res.status(200).json({
      status: "Success",
      data: {
        bankAccounts,
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
  fetchCurrentYearBankStatement,
  deleteBankStatement,
  createBankAccount,
  getAllBankAccounts,
};
