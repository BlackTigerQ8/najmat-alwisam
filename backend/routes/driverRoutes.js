const express = require("express");
const {
  getAllDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverSalaries,
} = require("../controllers/driverController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { driverContractUpload } = require("./uploadRoutes");

const router = express.Router();

router
  .route("/salaries")
  .get(protect, restrictTo("Admin", "Accountant"), getDriverSalaries);

router
  .route("/")
  .get(protect, getAllDrivers)
  .post(
    protect,
    restrictTo("Admin", "Manager", "Employee"),
    driverContractUpload.single("uploadedFile"),
    createDriver
  );
router
  .route("/:id")
  .get(protect, getDriver)
  .patch(protect, driverContractUpload.single("uploadedFile"), updateDriver)
  .delete(protect, restrictTo("Admin", "Manager"), deleteDriver);

module.exports = router;
