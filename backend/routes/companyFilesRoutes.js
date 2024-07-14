const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getAllCompanyFiles,
  createCompanyFiles,
  deleteCompanyFile,
  editCompanyFile,
} = require("../controllers/companyFilesController");
const { companyFilesUpload } = require("../routes/uploadRoutes");

const router = express.Router();

router
  .route("/")
  .get(getAllCompanyFiles)
  .post(protect, companyFilesUpload.single("uploadedFile"), createCompanyFiles);

router
  .route("/:id")
  .delete(protect, deleteCompanyFile)
  .put(protect, editCompanyFile);

module.exports = router;
