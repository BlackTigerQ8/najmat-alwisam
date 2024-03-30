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
    //.populate("deductedFromUser", "firstName lastName")
    //.populate("deductedFromDriver", "firstName lastName")
    //.populate("spendType", "name");
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
    } = req.body;

    if (deductedFromUser && deductedFromDriver)
      return res.status(400).json({
        message:
          "Petty cash invoice cannot be set for driver and user at the same time",
      });

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
      .sort({ serialNumber: -1 })
      .limit(1);

    console.log("latestPettyCash", latestPettyCash);

    if (!latestPettyCash) {
      if (!currentBalance)
        throw new Error(
          "Does not have starting balance for first petty cash result"
        );

      const pettyCash = new PettyCash({
        serialNumber: 1,
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
      serialNumber: latestPettyCash.serialNumber + 1,
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

module.exports = {
  getAllPettyCash,
  createPettyCash,
};
