const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  getAllArchive,
  getArchive,
  addArchive,
  updateArchive,
  deleteArchive,
} = require("../controllers/archiveController");
const { archiveUpload } = require("./uploadRoutes");

const router = express.Router();

router
  .route("/")
  .get(protect, getAllArchive)
  .post(
    protect,
    restrictTo("Admin", "Manager", "Employee", "Accountant"),
    archiveUpload.single("uploadedFile"),
    addArchive
  );

router
  .route("/:id")
  .get(protect, getArchive)
  .patch(
    protect,
    restrictTo("Admin", "Manager", "Employee", "Accountant"),
    archiveUpload.single("uploadedFile"),
    updateArchive
  )
  .delete(
    protect,
    restrictTo("Admin", "Manager", "Employee", "Accountant"),
    deleteArchive
  );

module.exports = router;
