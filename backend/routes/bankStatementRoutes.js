const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  getAllBankStatement,
  updateBankStatement,
  createBankStatementRecord,
  searchBankStatementRecords,
  fetchCurrentYearBankStatement,
} = require("../controllers/bankStatementController");

const router = express.Router();

router
  .route("/")
  .get(protect, restrictTo("Admin", "Accountant"), getAllBankStatement)
  .post(protect, restrictTo("Admin", "Accountant"), createBankStatementRecord)
  .patch(protect, restrictTo("Admin", "Accountant"), updateBankStatement);

router
  .route("/search")
  .post(protect, restrictTo("Admin", "Accountant"), searchBankStatementRecords);

router
  .route("/current-year")
  .get(
    protect,
    restrictTo("Admin", "Accountant"),
    fetchCurrentYearBankStatement
  );
module.exports = router;
