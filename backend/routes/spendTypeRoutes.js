const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  getAllSpendTypes,
  createSpendType,
} = require("../controllers/spendTypeController");

const router = express.Router();

router
  .route("/")
  .get(getAllSpendTypes)
  .post(protect, restrictTo("Admin", "Accountant"), createSpendType);

module.exports = router;
