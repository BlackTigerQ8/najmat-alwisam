const path = require("path");
const CompanyFiles = require("../models/companyFilesModel");
const fs = require("fs");
const iconv = require("iconv-lite");

// @desc    Get a Company File
// @route   GET /api/company-files
// @access  Private/All
const getAllCompanyFiles = async (req, res) => {
  try {
    const companyFiles = await CompanyFiles.find({});

    res.status(200).json({
      status: "Success",
      data: {
        companyFiles,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Upload a Company File
// @route   POST /api/company-files
// @access  Private/All
const createCompanyFiles = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "File is a required field",
      });
    }

    const originalName = iconv.decode(
      Buffer.from(file.originalname, "binary"),
      "utf8"
    );

    const companyFile = new CompanyFiles({
      name: path.parse(originalName).name,
      filePath: file.path,
    });

    await companyFile.save();

    return res.status(201).json({
      status: "Success",
      data: {
        companyFile,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Delete a Company File
// @route   DELETE /api/company-files/:id
// @access  Private/All
const deleteCompanyFile = async (req, res) => {
  try {
    await CompanyFiles.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "Success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const editCompanyFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName) {
      return res.status(400).json({
        status: "Error",
        message: "New name is a required field",
      });
    }

    const companyFile = await CompanyFiles.findById(id);
    if (!companyFile) {
      return res.status(404).json({
        status: "Error",
        message: "File not found",
      });
    }

    const oldFilePath = companyFile.filePath;
    const fileDir = path.dirname(oldFilePath);
    const newFilePath = path.join(fileDir, newName + path.extname(oldFilePath));

    // Rename the physical file
    fs.rename(oldFilePath, newFilePath, async (err) => {
      if (err) {
        return res.status(500).json({
          status: "Error",
          message: err.message,
        });
      }

      // Update the file details in the database
      companyFile.name = newName;
      companyFile.filePath = newFilePath;

      await companyFile.save();

      res.status(200).json({
        status: "Success",
        data: {
          companyFile,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

module.exports = {
  getAllCompanyFiles,
  createCompanyFiles,
  deleteCompanyFile,
  editCompanyFile,
};
