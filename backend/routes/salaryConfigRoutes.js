const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const router = express.Router();
const {
  getSalaryConfigs,
  getSalaryConfigByVehicle,
  createSalaryConfig,
  updateSalaryConfig,
  deleteSalaryConfig,
} = require("../controllers/salaryConfigController");

router
  .route("/")
  .get(protect, getSalaryConfigs)
  .post(protect, restrictTo("Admin"), createSalaryConfig);

router
  .route("/:vehicleType")
  .get(protect, getSalaryConfigByVehicle)
  .put(protect, restrictTo("Admin"), updateSalaryConfig)
  .delete(protect, restrictTo("Admin"), deleteSalaryConfig);

module.exports = router;
