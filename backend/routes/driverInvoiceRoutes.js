const express = require("express");
const {
  createDriverInvoice,
  getAllInvoices,
  overrideDriverSalary,
  updateInvoiceStatus,
} = require("../controllers/driverController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/invoice")
  .get(protect, getAllInvoices)
  .post(
    protect,
    restrictTo("Admin", "Manager", "Employee", "Accountant"),
    createDriverInvoice
  );

router.put(
  "/invoice/:id",
  protect,
  restrictTo("Admin", "Accountant"),
  updateInvoiceStatus
);

router
  .route("/override")
  .post(protect, restrictTo("Admin", "Accountant"), overrideDriverSalary);

module.exports = router;
