const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getAllCompanyFiles,
  createCompanyFiles,
  deleteCompanyFile,
} = require("../controllers/companyFilesController");

const router = express.Router();

router.route("/").get(getAllCompanyFiles).post(protect, createCompanyFiles);

router.route("/:id").delete(protect, deleteCompanyFile);

module.exports = router;
