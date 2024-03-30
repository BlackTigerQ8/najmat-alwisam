const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  getAllPettyCash,
  createPettyCash,
} = require("../controllers/pettyCashController");

const router = express.Router();

router
  .route("/")
  .get(getAllPettyCash)
  .post(protect, restrictTo("Admin", "Accountant"), createPettyCash);

module.exports = router;
