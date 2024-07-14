const { User } = require("../models/userModel");
const { Message } = require("../models/messageModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const EmployeeInvoice = require("../models/employeeInvoiceModel");
const Notification = require("../models/notificationModel");
const { getMonthDateRange } = require("../utils/date");
const { uniq } = require("lodash");

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

    // Prepare the updated data
    const updateData = { ...req.body, file: filePath ?? req.body.file };

    // Check if password is included in the request body and hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      updateData.password = hashedPassword;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

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

const getAllInvoices = async (req, res) => {
  console.log("In get all employee invoices method");
  try {
    let status = undefined;
    switch (req.user.role) {
      case "Admin":
        status = "pendingAdminReview";
        break;
      case "Manager":
        status = "pendingManagerReview";
        break;
      case "Accountant":
        status = "approved";
        break;
    }
    const employeeInvoices = await getEmployeeInvoices([
      status,
      "visibleToAll",
    ]);

    res.status(200).json({
      status: "Success",
      data: {
        employeeInvoices,
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

async function getEmployeeInvoices(status = ["approved"], customDates) {
  const { startDate, endDate } = customDates || getMonthDateRange();

  const invoices = await EmployeeInvoice.find({
    status: { $in: status },
    invoiceDate: {
      $gte: startDate,
      $lt: endDate,
    },
  }).populate("user");

  return invoices.filter((invoice) => invoice.user);
}

const getEmployeesSalary = async (req, res) => {
  try {
    const startDate = req.query.startDate || undefined;
    const endDate = req.query.endDate || undefined;

    const status =
      startDate && endDate ? ["approved", "archived"] : ["approved"];
    const dateFilter =
      startDate && endDate ? { startDate, endDate } : undefined;
    const invoices = await getEmployeeInvoices(status, dateFilter);

    if (!invoices.length) {
      const users = await User.find({ role: { $ne: "Admin" } });

      return res.status(200).json({
        status: "Success",
        data: {
          employeeSalaries: users.map((user) => ({
            sequenceNumber: user.sequenceNumber,
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

    const users = await User.find({ role: { $ne: "Admin" } });

    // Check if user already exists in userData, if not, create new entry
    for (const userInfo of users) {
      const userId = userInfo._id;

      userData[userId] = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        _id: userId,
        mainSalary: userInfo.mainSalary,
        companyDeductionAmount: 0,
        totalSalary: userInfo.mainSalary,
        totalInvoices: 0,
        deductionReason: "",
        additionalSalary: 0,
      };
    }

    for (const invoice of invoices) {
      if (!invoice.user) continue;

      const {
        user,
        additionalSalary,
        companyDeductionAmount,
        deductionReason,
        remarks,
      } = invoice;
      const userId = user._id;

      // Update user data with deductions and main salary
      userData[userId].companyDeductionAmount += companyDeductionAmount || 0;
      userData[userId].additionalSalary += additionalSalary || 0;
      userData[userId].totalInvoices++;
      if (deductionReason) userData[userId].deductionReason = deductionReason;
      if (remarks) userData[userId].remarks = remarks;
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

  const existingInvoice = await EmployeeInvoice.findOne({
    status: { $in: ["approved"] },
    invoiceDate: {
      $gte: firstDayOfMonth,
      $lt: firstDayOfNextMonth,
    },
    user: userId,
    additionalSalary: { $gt: 0 },
  });

  /** All invoices should be set using yesterday's date */
  const invoiceDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

  if (existingInvoice) {
    existingInvoice.additionalSalary = additionalSalary;
    existingInvoice.remarks = remarks;
    await existingInvoice.save();
  } else {
    const newInvoice = new EmployeeInvoice({
      invoiceDate,
      additionalSalary,
      remarks,
      user: userId,
      invoiceAddedBy: req.user.id,
      status: "approved",
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

const createEmployeeDeductionInvoice = async (req, res) => {
  try {
    const {
      selectedUser: userId,
      deductionReason = "",
      companyDeductionAmount = 0,
    } = req.body;

    const uploadedFile = req.file;
    const filePath = uploadedFile ? uploadedFile.path : null;

    let status = undefined;
    let notification_recipient_role = undefined;
    switch (req.user.role) {
      case "Admin":
        status = "approved";
        notification_recipient_role = "Accountant";
        break;
      case "Manager":
        status = "pendingAdminReview";
        notification_recipient_role = "Admin";
        break;
      case "Employee":
        status = "pendingManagerReview";
        notification_recipient_role = "Manager";
        break;
      case "Accountant":
        status = "pendingAdminReview";
        notification_recipient_role = "Admin";
        break;
    }

    /** All invoices should be set using yesterday's date */
    const currentDate = new Date();
    const invoiceDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User does not exist" });

    const newInvoice = new EmployeeInvoice({
      user: userId,
      companyDeductionAmount,
      deductionReason,
      invoiceDate,
      invoiceAddedBy: req.user.id,
      status,
      file: filePath,
    });

    const invoices = await EmployeeInvoice.find({});
    console.log("invoices", invoices);

    await newInvoice.save();

    if (req.user.role !== "Admin") {
      const notification = new Notification({
        //heading: `${user.firstName} ${user.lastName} Deduction Alert`,
        role: [notification_recipient_role],
        notification_type: "Employee_Deduction",
        // message: `${req.user.firstName} ${req.user.lastName} (${
        //   req.user.role
        // }) has made a deduction request on ${new Date().toDateString()}`,
        additionalDetails: {
          senderName: `${req.user.firstName} ${req.user.lastName}`,
          senderRole: req.user.role,
          targetName: `${user.firstName} ${user.lastName}`,
          date: `${new Date().toDateString()}`,
          subType: "Add",
        },
      });

      await notification.save();
    }

    return res.status(201).json({
      status: "Success",
      data: {
        invoice: { ...newInvoice._doc, user: { _id: newInvoice.user } },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { selectedUsers, message } = req.body;

    // Check if selectedUsers is an array
    if (!Array.isArray(selectedUsers)) {
      return res.status(400).json({
        status: "Error",
        message: "selectedUsers must be an array",
      });
    }

    // Create a new message instance
    const newMessage = new Message({
      sender: req.user.id, // Assuming the sender is the currently logged-in user
      message,
      timestamp: Date.now(), // Add timestamp
      receivers: selectedUsers,
    });

    // Save the new message
    await newMessage.save();

    for (const selectedUser of selectedUsers) {
      const notification = new Notification({
        forUserId: selectedUser,
        //heading: `New Message Alert`,
        role: [req.user.role],
        notification_type: "New_Message",
        // message: `${req.user.firstName} ${req.user.lastName} (${
        //   req.user.role
        // }) has sent you a message on ${new Date().toDateString()}`,
        additionalDetails: {
          senderName: `${req.user.firstName} ${req.user.lastName}`,
          senderRole: req.user.role,
          date: `${new Date().toDateString()}`,
        },
      });

      await notification.save();
    }

    // Return success response if all messages are sent successfully
    res.status(200).json({
      status: "Success",
      message: newMessage,
    });
  } catch (error) {
    console.error("Error sending messages:", error);
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// @desc    Fetch messages for the currently logged-in user
// @route   GET /api/messages
// @access  Private
const fetchMessages = async (req, res) => {
  try {
    // Fetch messages from the database where the receiver is the currently logged-in user
    const messages = await Message.find({ receivers: req.user.id });

    res.status(200).json({
      status: "Success",
      data: {
        messages,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const isRejected = status.toLowerCase().includes("rejected");

    const invoice = await EmployeeInvoice.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("user")
      .populate("invoiceAddedBy");

    console.log("Invoice", invoice);

    let notification_recipient_role = undefined;
    switch (req.user.role) {
      case "Admin":
        notification_recipient_role = isRejected
          ? [invoice.invoiceAddedBy.role]
          : uniq(["Accountant", invoice.invoiceAddedBy.role]);
        break;
      case "Manager":
        notification_recipient_role = isRejected
          ? [invoice.invoiceAddedBy.role]
          : ["Admin"];
        break;
    }

    for (const role of notification_recipient_role) {
      const notification = new Notification({
        forUserId:
          role === invoice.invoiceAddedBy.role
            ? invoice.invoiceAddedBy._id
            : undefined,
        //heading: `${invoice.user.firstName} ${invoice.user.lastName} Deduction Alert`,
        role: [role],
        notification_type: "Employee_Deduction",
        // message: `${req.user.firstName} ${req.user.lastName} (${
        //   req.user.role
        // }) has ${
        //   isRejected ? "rejected " : "approved"
        // } deduction request on ${new Date().toDateString()}`,
        additionalDetails: {
          senderName: `${req.user.firstName} ${req.user.lastName}`,
          senderRole: req.user.role,
          targetName: `${invoice.user.firstName} ${invoice.user.firstName}`,
          date: `${new Date().toDateString()}`,
          subType: isRejected ? "Reject " : "Approve",
        },
      });

      await notification.save();
    }

    res.status(200).json({
      status: "Success",
      data: { invoice },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
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
  createEmployeeDeductionInvoice,
  sendMessage,
  fetchMessages,
  getAllInvoices,
  updateInvoiceStatus,
};
