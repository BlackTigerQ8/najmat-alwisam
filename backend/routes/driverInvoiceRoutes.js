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
  getDriverStatsByMonth,
  restoreInvoices,
  cleanupOrphanedInvoices,
  updateInvoiceDetails,
  createArchivedDriverInvoice,
  // clearRecentInvoices,
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

router
  .route("/invoice/:id")
  .get(protect, getAllInvoices)
  .post(
    protect,
    restrictTo("Admin", "Manager", "Employee", "Accountant"),
    driverInvoicesUpload.single("uploadedFile"),
    createDriverInvoice
  )
  .put(
    protect,
    restrictTo("Admin", "Manager", "Employee", "Accountant"),
    updateInvoiceDetails
  )
  .patch(
    protect,
    restrictTo("Admin", "Manager", "Employee", "Accountant"),
    updateInvoiceDetails
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

router.post(
  "/archive-invoice",
  protect,
  restrictTo("Admin", "Manager", "Employee", "Accountant"),
  driverInvoicesUpload.single("uploadedFile"),
  createArchivedDriverInvoice
);

router
  .route("/archived/search")
  .post(
    protect,
    restrictTo("Employee", "Admin", "Manager", "Accountant"),
    filterArchivedInvoices
  );

router
  .route("/archived")
  .get(
    protect,
    restrictTo("Employee", "Admin", "Manager", "Accountant"),
    fetchArchivedInvoices
  );

router
  .route("/override")
  .post(protect, restrictTo("Admin", "Accountant"), overrideDriverSalary);

router.get(
  "/stats/month",
  protect,
  restrictTo("Admin", "Manager"),
  getDriverStatsByMonth
);

router.put(
  "/restore",
  protect,
  restrictTo("Admin", "Employee", "Manager"),
  restoreInvoices
);

router.delete(
  "/cleanup-orphaned",
  protect,
  restrictTo("Admin"),
  cleanupOrphanedInvoices
);

// router.delete(
//   "/today/:driverId",
//   protect,
//   restrictTo("Admin"),
//   clearRecentInvoices
// );

module.exports = router;
