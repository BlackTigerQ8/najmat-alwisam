const express = require("express");
const {
  createDriverInvoice,
  getAllInvoices,
  overrideDriverSalary,
  updateInvoiceStatus,
  resetInvoices,
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
  restrictTo("Admin", "Accountant", "Manager"),
  updateInvoiceStatus
);

router.put(
  "/reset",
  protect,
  restrictTo("Admin", "Employee", "Manager"),
  resetInvoices
);

router
  .route("/override")
  .post(protect, restrictTo("Admin", "Accountant"), overrideDriverSalary);

module.exports = router;
