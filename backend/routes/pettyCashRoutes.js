const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  getAllPettyCash,
  createPettyCash,
  searchPettyCash,
  fetchCurrentYearPettyCash,
  updatePettyCash,
  deletePettyCash,
} = require("../controllers/pettyCashController");

const router = express.Router();

router
  .route("/")
  .get(getAllPettyCash)
  .post(protect, restrictTo("Admin", "Accountant"), createPettyCash);

router
  .route("/search")
  .post(protect, restrictTo("Admin", "Accountant"), searchPettyCash);

router
  .route("/current-year")
  .get(protect, restrictTo("Admin", "Accountant"), fetchCurrentYearPettyCash);

router
  .route("/:id")
  .patch(protect, restrictTo("Admin", "Accountant"), updatePettyCash)
  .delete(protect, restrictTo("Admin", "Accountant"), deletePettyCash);

module.exports = router;
