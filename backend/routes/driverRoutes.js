const express = require("express");
const {
  getAllDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
} = require("../controllers/driverController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getAllDrivers)
  .post(protect, restrictTo("Admin", "Employee"), createDriver);
router
  .route("/:id")
  .get(protect, getDriver)
  .patch(protect, updateDriver)
  .delete(protect, restrictTo("Admin", "Employee"), deleteDriver);

module.exports = router;
