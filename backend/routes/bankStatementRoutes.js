const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  getAllBankStatement,
  updateBankStatement,
  createBankStatementRecord,
  searchBankStatementRecords,
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
module.exports = router;
