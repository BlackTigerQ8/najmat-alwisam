const express = require("express");
const {
  createDriverInvoice,
  getAllInvoices,
  overrideDriverSalary,
  updateInvoiceStatus,
  resetInvoices,
  fetchArchivedInvoices,
  filterArchivedInvoices,
  resetDriverInvoices,
} = require("../controllers/driverController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { driverInvoicesUpload } = require("./uploadRoutes");

const router = express.Router();

router
  .route("/invoice")
  .get(protect, getAllInvoices)
  .post(
    protect,
    restrictTo("Admin", "Manager", "Employee", "Accountant"),
    driverInvoicesUpload.single("uploadedFile"),
    createDriverInvoice
  );

router.put(
  "/invoice/:id",
  protect,
  restrictTo("Admin", "Accountant", "Manager"),
  updateInvoiceStatus
);

router.put(
  "/reset/drivers/:driverId",
  protect,
  restrictTo("Admin", "Employee", "Manager"),
  resetDriverInvoices
);

router.put(
  "/reset",
  protect,
  restrictTo("Admin", "Employee", "Manager"),
  resetInvoices
);

router
  .route("/archived/search")
  .post(
    protect,
    restrictTo("Employee", "Admin", "Manager"),
    filterArchivedInvoices
  );

router
  .route("/archived")
  .get(
    protect,
    restrictTo("Employee", "Admin", "Manager"),
    fetchArchivedInvoices
  );

router
  .route("/override")
  .post(protect, restrictTo("Admin", "Accountant"), overrideDriverSalary);

module.exports = router;
