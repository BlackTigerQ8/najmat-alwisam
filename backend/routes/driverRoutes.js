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
  .post(protect, restrictTo("Admin", "Manager", "Employee"), createDriver);
router
  .route("/:id")
  .get(protect, getDriver)
  .patch(protect, updateDriver)
  .delete(protect, restrictTo("Admin", "Manager"), deleteDriver);

module.exports = router;
