const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  getAllCompanyIncome,
  createCompanyIncome,
} = require("../controllers/companyIncomeController");

const router = express.Router();

router
  .route("/")
  .get(protect, restrictTo("Admin", "Accountant"), getAllCompanyIncome)
  .post(protect, restrictTo("Admin", "Accountant"), createCompanyIncome);
