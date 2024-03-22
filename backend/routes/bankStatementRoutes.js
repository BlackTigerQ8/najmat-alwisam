const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  getAllBankStatement,
  updateBankStatement,
} = require("../controllers/bankStatementController");

const router = express.Router();

router.route("/").get(getAllBankStatement).patch(updateBankStatement);

module.exports = router;
