const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  getAllPettyCash,
  createPettyCash,
  searchPettyCash,
} = require("../controllers/pettyCashController");

const router = express.Router();

router
  .route("/")
  .get(getAllPettyCash)
  .post(protect, restrictTo("Admin", "Accountant"), createPettyCash);

router
  .route("/search")
  .post(protect, restrictTo("Admin", "Accountant"), searchPettyCash);

module.exports = router;
