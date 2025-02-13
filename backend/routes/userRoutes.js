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
  removeProfileImage,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  contractUpload,
  userInvoicesUpload,
  messageAttachmentsUpload,
} = require("./uploadRoutes");

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
    restrictTo("Admin", "Manager", "Accountant", "Employee"),
    userInvoicesUpload.single("uploadedFile"),
    createEmployeeDeductionInvoice
  );

router
  .route("/messages")
  .post(protect, messageAttachmentsUpload.single("file"), sendMessage)
  .get(protect, fetchMessages);

router.get(
  "/invoices",
  protect,
  restrictTo("Admin", "Accountant", "Manager", "Employee"),
  getAllInvoices
);

router.put(
  "/invoice/:id",
  protect,
  restrictTo("Admin", "Accountant", "Manager"),
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

router.delete("/:id/profile-image", protect, removeProfileImage);

router.post("/logout", protect, logoutUser);
router.post("/login", loginUser);

module.exports = router;
