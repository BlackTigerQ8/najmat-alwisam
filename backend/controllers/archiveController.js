const Archive = require("../models/archiveModel");

// @desc    Get all archive
// @route   GET /api/archives
// @access  Private/
const getAllArchive = async (req, res) => {
  try {
    const archives = await Archive.find();
    res.status(200).json({
      status: "Success",
      data: {
        archives,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Get an archive
// @route   GET /api/archives/:id
// @access  Private/
const getArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);

    // check if the achrive exists
    if (!archive) {
      return res.status(404).json({
        status: "Error",
        message: "Archive not found",
      });
    }

    res.status(200).json({
      status: "Success",
      data: {
        archive,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Add an archive
// @route   POST /api/archives
// @access  Private/Admin_and_Manager
const addArchive = async (req, res) => {
  try {
    const uploadedFile = req.file;
    const filePath = uploadedFile ? uploadedFile.path : null;

    // Ensure the required fields are included
    if (
      !req.body.fullName ||
      !req.body.company ||
      !req.body.idNumber ||
      !req.body.workNumber
    ) {
      return res.status(400).json({
        status: "Error",
        message: "Required fields are missing",
      });
    }

    const newArchive = await Archive.create({
      ...req.body,
      uploadedFile: filePath,
    });

    res.status(201).json({
      status: "Success",
      data: { archive: newArchive },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Update an archive
// @route   PATCH /api/archives/:id
// @access  Private
const updateArchive = async (req, res) => {
  try {
    const uploadedFile = req.file;
    const filePath = uploadedFile ? uploadedFile.path : null;

    const archive = await Archive.findByIdAndUpdate(
      req.params.id,
      { ...req.body, uploadedFile: filePath ?? req.body.uploadedFile },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!archive) {
      return res.status(404).json({
        status: "Error",
        message: "Archive not found",
      });
    }

    res.status(200).json({
      status: "Success",
      data: { archive },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Delete an archive
// @route   DELETE /api/archives/:id
// @access  Private
const deleteArchive = async (req, res) => {
  try {
    const archive = await Archive.findByIdAndDelete(req.params.id);

    if (!archive) {
      return res.status(404).json({
        status: "Error",
        message: "Archive not found",
      });
    }

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
  getAllArchive,
  getArchive,
  addArchive,
  updateArchive,
  deleteArchive,
};
