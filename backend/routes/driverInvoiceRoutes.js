const express = require("express");
const {
  createDriverInvoice,
  getAllInvoices,
} = require("../controllers/driverController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/invoice")
  .get(protect, getAllInvoices)
  .post(protect, createDriverInvoice);

module.exports = router;
