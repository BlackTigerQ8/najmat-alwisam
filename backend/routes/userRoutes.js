const express = require("express");
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  logoutUser,
  loginUser,
  getEmployeesSalary,
  updateEmployeeSalary,
  createEmployeeDeductionInvoice,
  sendMessage,
  fetchMessages,
  getAllInvoices,
  updateInvoiceStatus,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { contractUpload } = require("./uploadRoutes");

const router = express.Router();

router
  .route("/salaries")
  .get(protect, restrictTo("Admin", "Accountant"), getEmployeesSalary);

router
  .route("/:id/salary")
  .patch(
    protect,
    restrictTo("Admin", "Manager", "Accountant"),
    updateEmployeeSalary
  );

router
  .route("/:id/invoice")
  .post(
    protect,
    restrictTo("Admin", "Manager", "Accountant"),
    createEmployeeDeductionInvoice
  );

router
  .route("/messages")
  .post(protect, sendMessage)
  .get(protect, fetchMessages);

router.get(
  "/invoices",
  protect,
  restrictTo("Admin", "Accountant"),
  getAllInvoices
);

router.put(
  "/invoice/:id",
  protect,
  restrictTo("Admin", "Accountant"),
  updateInvoiceStatus
);

router
  .route("/")
  .get(protect, getAllUsers)
  .post(
    protect,
    restrictTo("Admin", "Manager"),
    contractUpload.single("uploadedFile"),
    createUser
  );

router
  .route("/:id")
  .get(protect, getUser)
  .patch(
    protect,
    restrictTo("Admin", "Manager"),
    contractUpload.single("uploadedFile"),
    updateUser
  )
  .delete(protect, restrictTo("Admin", "Manager"), deleteUser);
router.post("/logout", protect, logoutUser);
router.post("/login", loginUser);

module.exports = router;
