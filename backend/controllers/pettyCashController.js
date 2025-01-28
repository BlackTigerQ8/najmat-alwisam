const PettyCash = require("../models/pettyCashModel");
const SpendType = require("../models/spendTypeModel");
const Driver = require("../models/driverModel");
const { User } = require("../models/userModel");

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

const createPettyCash = async (req, res) => {
  try {
    const {
      requestApplicant,
      requestDate,
      spendsDate,
      spendsReason,
      cashAmount = 0,
      spendType: spendTypeId,
      spendsRemarks = "",
      deductedFromUser = undefined,
      deductedFromDriver = undefined,
      currentBalance = 0,
      serialNumber,
    } = req.body;

    if (deductedFromUser && deductedFromDriver)
      return res.status(400).json({
        message:
          "Petty cash invoice cannot be set for driver and user at the same time",
      });

    /** TODO: Add check for inactive driver here */
    if (deductedFromDriver) {
      const driver = await Driver.findById(deductedFromDriver);

      if (!driver)
        return res.status(404).json({ message: "Driver does not exist" });
    }

    if (deductedFromUser) {
      const user = await User.findById(deductedFromUser);
      if (!user)
        return res.status(404).json({ message: "User does not exist" });
    }

    const spendType = await SpendType.findById(spendTypeId);
    if (!spendType)
      return res.status(404).json({ message: "Spend type does not exist" });

    const latestPettyCash = await PettyCash.findOne()
      .sort({ sequence: -1 })
      .limit(1);

    if (!latestPettyCash) {
      if (!currentBalance)
        throw new Error(
          "Does not have starting balance for first petty cash result"
        );

      const pettyCash = new PettyCash({
        serialNumber,
        sequence: 1,
        requestApplicant,
        requestDate,
        spendsDate,
        spendsReason,
        cashAmount,
        spendType: spendTypeId,
        spendsRemarks,
        deductedFromUser,
        deductedFromDriver,
        currentBalance,
        addedByUser: req.user.id,
      });

      await pettyCash.save();

      return res.status(201).json({
        status: "Success",
        data: {
          pettyCash,
        },
      });
    }

    const pettyCash = new PettyCash({
      serialNumber,
      sequence: latestPettyCash.sequence + 1,
      requestApplicant,
      requestDate,
      spendsDate,
      spendsReason,
      cashAmount,
      spendType: spendTypeId,
      spendsRemarks,
      deductedFromUser,
      deductedFromDriver,
      currentBalance:
        latestPettyCash.currentBalance -
        (!deductedFromUser && !deductedFromDriver ? cashAmount : 0),
      previousBalance: latestPettyCash.currentBalance,
      addedByUser: req.user.id,
    });

    await pettyCash.save();

    return res.status(201).json({
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

const searchPettyCash = async (req, res) => {
  const { serialNumber, requestApplicant, requestDate, startDate, endDate } =
    req.body;

  let query = {};

  if (serialNumber) {
    query.serialNumber = serialNumber;
  }
  if (requestApplicant) {
    query.requestApplicant = new RegExp(requestApplicant, "i"); // Case-insensitive search
  }
  if (requestDate) {
    query.requestDate = new Date(requestDate);
  }

  if (startDate || endDate) {
    query.spendsDate = {};
    if (startDate) {
      query.spendsDate.$gte = new Date(startDate);
    }
    if (endDate) {
      // Add one day to include the end date fully
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      query.spendsDate.$lt = endDateTime;
    }
  }

  try {
    const results = await PettyCash.find(query);
    res.status(200).json({
      status: "Success",
      data: {
        results,
      },
    });
  } catch (error) {
    console.error("Error searching petty cash records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const fetchCurrentMonthPettyCash = async () => {
  const currentDate = new Date();

  // Get the first day of the current month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  // Get the first day of the next month
  const firstDayOfNextMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  );

  const pettyCash = await PettyCash.find({
    status: { $in: ["pending", "approved"] },
    spendsDate: {
      $gte: firstDayOfMonth,
      $lt: firstDayOfNextMonth,
    },
  });

  return pettyCash;
};

const fetchCurrentYearPettyCash = async (req, res) => {
  const currentDate = new Date();

  // Get the first day of the current year
  const firstDayOffYear = new Date(currentDate.getFullYear(), 0, 1);

  // Get the first day of the next year
  const firstDayOffNextYear = new Date(currentDate.getFullYear() + 1, 0, 1);

  const pettyCash = await PettyCash.find({
    status: { $in: ["pending", "approved", "archived"] },
    spendsDate: {
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

const updatePettyCash = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate that only one deduction field is set
    if (updates.deductedFromUser && updates.deductedFromDriver) {
      return res.status(400).json({
        message: "Cannot deduct from both user and driver simultaneously",
      });
    }

    // Verify referenced entities exist if being updated
    if (updates.deductedFromDriver) {
      const driver = await Driver.findById(updates.deductedFromDriver);
      if (!driver) {
        return res.status(404).json({ message: "Driver does not exist" });
      }
    }

    if (updates.deductedFromUser) {
      const user = await User.findById(updates.deductedFromUser);
      if (!user) {
        return res.status(404).json({ message: "User does not exist" });
      }
    }

    const pettyCash = await PettyCash.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true }
    );

    if (!pettyCash) {
      return res.status(404).json({
        message: "Petty cash record not found",
      });
    }

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
  createPettyCash,
  searchPettyCash,
  fetchCurrentMonthPettyCash,
  fetchCurrentYearPettyCash,
  updatePettyCash,
};
