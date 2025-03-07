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

router.route("/summary").get(protect, getDriverSummary);

router
  .route("/salaries")
  .get(protect, restrictTo("Admin", "Accountant"), getDriverSalaries);

router
  .route("/")
  .get(protect, getAllDrivers)
  .post(
    protect,
    restrictTo("Admin", "Manager", "Accountant", "Employee"),
    driverContractUpload.single("uploadedFile"),
    createDriver
  );

router.route("/inactive").get(protect, getInactiveDrivers);

router.route("/:id/inactive").put(protect, deactivateDriver);
router.route("/:id/active").put(protect, activateDriver);

router
  .route("/:id")
  .get(protect, getDriver)
  .patch(protect, driverContractUpload.single("uploadedFile"), updateDriver)
  .delete(protect, restrictTo("Admin", "Manager"), deleteDriver);

module.exports = router;
