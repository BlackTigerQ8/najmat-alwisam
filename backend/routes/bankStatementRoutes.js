const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  getAllBankStatement,
  updateBankStatement,
  createBankStatementRecord,
} = require("../controllers/bankStatementController");

const router = express.Router();

router
  .route("/")
  .get(getAllBankStatement)
  .post(protect, restrictTo("Admin", "Accountant"), createBankStatementRecord)
  .patch(protect, restrictTo("Admin", "Accountant"), updateBankStatement);

module.exports = router;
