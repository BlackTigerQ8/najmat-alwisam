const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  getAllSpendTypes,
  createSpendType,
  deleteSpendType,
} = require("../controllers/spendTypeController");

const router = express.Router();

router
  .route("/")
  .get(getAllSpendTypes)
  .post(protect, restrictTo("Admin", "Accountant"), createSpendType);

router.route("/:id").delete(protect, restrictTo("Accountant"), deleteSpendType);

module.exports = router;
