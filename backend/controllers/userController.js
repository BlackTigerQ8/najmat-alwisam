const { User } = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const EmployeeInvoice = require("../models/employeeInvoiceModel");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "Success",
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        status: "Error",
        message: "User not found",
      });
    }

    // Check if the user is accessing their own data or is an admin
    if (req.user.id !== req.params.id && req.user.role !== "Admin") {
      return res.status(403).json({
        status: "Error",
        message: "You do not have permission to perform this action",
      });
    }

    res.status(200).json({
      status: "Success",
      data: {
        user: {
          ...user._doc,
          imagePath: user.image,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const uploadedFile = req.file;
    const filePath = uploadedFile ? uploadedFile.path : null;

    const newUser = await User.create({ ...req.body, file: filePath });
    res.status(201).json({
      status: "Success",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    // Check if the user is accessing their own data or is an admin
    if (
      req.user.id !== req.params.id &&
      req.user.role !== "Admin" &&
      req.user.role !== "Manager"
    ) {
      return res.status(403).json({
        status: "Error",
        message: "You do not have permission to perform this action",
      });
    }

    const uploadedFile = req.file;
    const filePath = uploadedFile ? uploadedFile.path : null;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, file: filePath ?? req.body.file },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "Success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
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

// @desc    Login user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: "Error",
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: "Error",
        message: "Invalid credentials",
      });
    }

    // Convert the Mongoose document to a plain JavaScript object
    const userObj = user.toObject();

    // Destructure the necessary properties
    const { firstName, lastName, email: userEmail, _id, role, image } = userObj;

    // Create token
    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(200).json({
      status: "Success",
      token,
      data: {
        user: { firstName, lastName, email: userEmail, _id, role, image },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res
    .status(200)
    .json({ status: "Success", message: "Logged out successfully" });
};

const getEmployeesSalary = async (_req, res) => {
  try {
    const currentDate = new Date();

    // Get the first day of the current month
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    // Get the first day of the next month
    const firstDayOfNextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );

    const invoices = await EmployeeInvoice.find({
      status: { $in: ["pending", "approved"] },
      invoiceDate: {
        $gte: firstDayOfMonth,
        $lt: firstDayOfNextMonth,
      },
    }).populate("user");

    if (!invoices.length) {
      const users = await User.find();

      return res.status(200).json({
        status: "Success",
        data: {
          employeeSalaries: users.map((user) => ({
            firstName: user.firstName,
            lastName: user.lastName,
            mainSalary: user.mainSalary,
            additionalSalary: 0,
            companyDeductionAmount: 0,
            deductionReason: "",
            totalSalary: user.mainSalary,
            remarks: "",
            _id: user._id,
          })),
        },
      });
    }

    const userData = {};

    for (const invoice of invoices) {
      const {
        user,
        additionalSalary,
        companyDeductionAmount,
        deductionReason,
        remarks,
      } = invoice;

      // Check if user already exists in userData, if not, create new entry
      if (!userData[user._id]) {
        userData[user._id] = {
          firstName: user.firstName,
          lastName: user.lastName,
          _id: user._id,
          mainSalary: user.mainSalary,
          totalDeductions: 0,
          totalSalary: user.mainSalary,
          totalInvoices: 0,
          deductionReason: "",
        };
      }

      // Update user data with deductions and main salary
      userData[userId._id].totalDeductions += companyDeductionAmount || 0;
      userData[userId._id].totalSalary += additionalSalary || 0;
      userData[userId._id].totalInvoices++;
      if (deductionReason)
        userData[userId._id].deductionReason = deductionReason;
      if (remarks) userData[userId._id].remarks = remarks;
    }

    res.status(200).json({
      status: "Success",
      data: {
        employeeSalaries: userData,
      },
    });
  } catch (error) {
    console.log("Get all invoice", error);
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const updateEmployeeSalary = async (req, res) => {
  const userId = req.params.id;
  const currentDate = new Date();
  const { additionalSalary, remarks } = req.body;

  // Get the first day of the current month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  // Get the first day of the next month
  const firstDayOfNextMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  );

  console.log("userId", userId);
  const existingInvoice = await EmployeeInvoice.findOne({
    status: { $in: ["pending", "approved"] },
    invoiceDate: {
      $gte: firstDayOfMonth,
      $lt: firstDayOfNextMonth,
    },
    user: userId,
    additionalSalary: { $gt: 0 },
  });

  console.log("existingInvoice", existingInvoice);

  /** All invoices should be set using yesterday's date */
  const invoiceDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

  if (existingInvoice) {
    existingInvoice.additionalSalary = additionalSalary;
    existingInvoice.remarks = remarks;
    await existingInvoice.save();
  } else {
    const newInvoice = new EmployeeInvoice({
      invoiceDate: invoiceDate,
      additionalSalary: additionalSalary,
      remarks: remarks,
      user: userId,
      invoiceAddedBy: req.user.id,
      status: "pending",
    });
    await newInvoice.save();
  }

  res.status(200).json({
    status: "Success",
    data: {
      updatedUser: {
        _id: userId,
        additionalSalary,
        remarks,
      },
    },
  });
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  logoutUser,
  loginUser,
  getEmployeesSalary,
  updateEmployeeSalary,
};
