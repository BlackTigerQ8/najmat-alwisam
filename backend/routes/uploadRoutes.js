const path = require("path");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const User = require("../models/userModel");
const { protect } = require("../middleware/authMiddleware");

// First storage configuration
const talabat = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "talabat"));
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Second storage configuration
const others = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "others"));
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Third storage configuration
const images = multer.diskStorage({
  destination: "./uploads/images",
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Fourth storage configuration
const contracts = multer.diskStorage({
  destination: "./uploads/users/contracts",
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// First upload instance
const upload1 = multer({
  storage: talabat,
  fileFilter: function (req, file, cb) {
    checkImageFileType(file, cb, "talabat");
  },
});

// Second upload instance
const upload2 = multer({
  storage: others,
  fileFilter: function (req, file, cb) {
    checkImageFileType(file, cb, "others");
  },
});

// Third upload instance
const upload3 = multer({
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

// Route for uploading to the first storage
router.post("/talabat", upload1.single("file"), (req, res) => {
  res.send({
    message: "File uploaded successfully to talabat",
    file: `/${req.file.path}`,
  });
});

// Route for uploading to the second storage
router.post("/others", upload2.single("file"), (req, res) => {
  res.send({
    message: "File uploaded successfully to others",
    file: `/${req.file.path}`,
  });
});

// Route for uploading to the third storage
router.post("/images", protect, upload3.single("file"), async (req, res) => {
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
});

module.exports = {
  contractUpload,
  router,
};
