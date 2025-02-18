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
  fetchSentMessages,
  getAllInvoices,
  updateInvoiceStatus,
  removeProfileImage,
  fetchReceivedMessages,
  updateProfileImage,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  contractUpload,
  userInvoicesUpload,
  messageAttachmentsUpload,
  imageUpload,
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
  .post(protect, messageAttachmentsUpload.single("file"), sendMessage);

router.route("/messages/sent").get(protect, fetchSentMessages);
router.route("/messages/received").get(protect, fetchReceivedMessages);

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

router
  .route("/:id/profile-image")
  .delete(protect, removeProfileImage)
  .post(protect, imageUpload.single("file"), updateProfileImage);

router.post("/logout", protect, logoutUser);
router.post("/login", loginUser);

module.exports = router;
