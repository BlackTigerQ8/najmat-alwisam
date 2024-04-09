const CompanyIncome = require("../models/companyIncomeModel");

const getAllCompanyIncome = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const companyIncome = await CompanyIncome.find({ year: currentYear });

    res.status(200).json({
      status: "Success",
      data: {
        companyIncome,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const createCompanyIncome = async (req, res) => {
  try {
    const {
      type,
      month,
      year,
      bikeIncome = 0,
      carIncome = 0,
      otherIncome = 0,
      refundCompany = "",
      refundAmount = 0,
      lastMonthIncome = 0,
      lendsIncome = 0,
      moneySafeBalance = 0,
    } = req.body;

    if (!type) throw new Error("Income type is required");

    if (!year) throw new Error("Income year is required");

    const companyIncome = new CompanyIncome({
      type,
      month,
      year,
      bikeIncome,
      carIncome,
      otherIncome,
      refundCompany,
      refundAmount,
      addedByUser: req.user.id,
      lastMonthIncome,
      lendsIncome,
      moneySafeBalance,
    });

    await companyIncome.save();

    return res.status(201).json({
      status: "Success",
      data: {
        companyIncome,
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
  getAllCompanyIncome,
  createCompanyIncome,
};
