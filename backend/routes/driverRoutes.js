const express = require("express");
const {
  getAllDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverSalaries,
  activateDriver,
  deactivateDriver,
  getInactiveDrivers,
  getDriverSummary,
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

router.route("/inactive").get(protect, getInactiveDrivers);

router.route("/:driverId/inactive").put(protect, deactivateDriver);
router.route("/:driverId/active").put(protect, activateDriver);

router
  .route("/:id")
  .get(protect, getDriver)
  .patch(protect, driverContractUpload.single("uploadedFile"), updateDriver)
  .delete(protect, restrictTo("Admin", "Manager"), deleteDriver);

router.route("/summary").get(getDriverSummary);

module.exports = router;
