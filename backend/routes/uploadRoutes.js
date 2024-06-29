const path = require("path");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const { User } = require("../models/userModel");
const { protect } = require("../middleware/authMiddleware");

const getUploadFileName = (file) =>
  `${Date.now()}-${path.parse(file.originalname).name}${path.extname(
    file.originalname
  )}`;

const talabatStorage = multer.diskStorage({
  destination: "./uploads/drivers/contracts/Talabat",
  filename: (req, file, cb) => {
    cb(null, getUploadFileName(file));
  },
});

const otherStorage = multer.diskStorage({
  destination: "./uploads/drivers/contracts/Others",
  filename: (req, file, cb) => {
    cb(null, getUploadFileName(file));
  },
});

// First storage configuration
const driverContracts = multer.diskStorage({
  destination: (req, _file, cb) => {
    const { contractType } = req.body;

    cb(null, "./uploads/drivers/contracts/" + contractType);
  },
  filename(req, file, cb) {
    cb(null, getUploadFileName(file));
  },
});

// Third storage configuration
const images = multer.diskStorage({
  destination: "./uploads/images",
  filename(req, file, cb) {
    cb(null, getUploadFileName(file));
  },
});

// Fourth storage configuration
const contracts = multer.diskStorage({
  destination: "./uploads/users/contracts",
  filename(req, file, cb) {
    cb(null, getUploadFileName(file));
  },
});

// First upload instance
const driverContractUpload = multer({
  storage: driverContracts,
});

// Third upload instance
const imageUpload = multer({
  storage: images,
  fileFilter: function (req, file, cb) {
    checkImageFileType(file, cb, "images");
  },
});

const contractUpload = multer({
  storage: contracts,
  fileFilter: function (req, file, cb) {
    checkPdfFileType(file, cb, "contract");
  },
});

function checkImageFileType(file, cb, storageType) {
  console.log("checkImageFileType", file);

  const filetypes = /pdf|jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb({
      message: `Allowed file types for ${storageType}: pdf, jpeg, jpg, png`,
    });
  }
}

function checkPdfFileType(file, cb, storageType) {
  console.log("checkPdfFileType", file);

  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb({
      message: `Allowed file types for ${storageType}: pdf, jpeg, jpg, png`,
    });
  }
}

// Route for uploading to the third storage
router.post(
  "/images",
  protect,
  imageUpload.single("file"),
  async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { image: req.file.path } },
        {
          new: true,
          runValidators: true,
        }
      );

      res.send({
        message: "File uploaded successfully to images",
        file: `${req.file.path}`,
        user: updatedUser,
      });
    } catch (error) {
      console.log("Error while saving image", error);

      return res.status(500).json({ error });
    }
  }
);

const driverInvoices = multer.diskStorage({
  destination: (req, _file, cb) => {
    cb(null, "./uploads/drivers/invoices");
  },
  filename(req, file, cb) {
    cb(null, getUploadFileName(file));
  },
});

const driverInvoicesUpload = multer({
  storage: driverInvoices,
  fileFilter: function (req, file, cb) {
    checkPdfFileType(file, cb, "invoices");
  },
});

const usersInvoices = multer.diskStorage({
  destination: (req, _file, cb) => {
    cb(null, "./uploads/users/invoices");
  },
  filename(req, file, cb) {
    cb(null, getUploadFileName(file));
  },
});

const userInvoicesUpload = multer({
  storage: usersInvoices,
  fileFilter: function (req, file, cb) {
    checkPdfFileType(file, cb, "invoices");
  },
});

module.exports = {
  contractUpload,
  driverContractUpload,
  router,
  driverInvoicesUpload,
  userInvoicesUpload,
};
