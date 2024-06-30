const CompanyFiles = require("../models/companyFilesModel");

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
    const { name } = req.body;

    if (!name)
      return res.status(400).json({
        message: "Name is a required filed",
      });

    const companyFile = new CompanyFiles({
      name,
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
    await CompanyFile.findByIdAndDelete(req.params.id);
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

module.exports = {
  getAllCompanyFiles,
  createCompanyFiles,
  deleteCompanyFile,
};
