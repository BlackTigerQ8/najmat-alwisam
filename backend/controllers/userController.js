const { User } = require("../models/userModel");
const { Message } = require("../models/messageModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const EmployeeInvoice = require("../models/employeeInvoiceModel");
const Notification = require("../models/notificationModel");
const { getMonthDateRange } = require("../utils/date");
const { uniq } = require("lodash");

// Utility function for sanitizing user data
const sanitizeUserData = (user) => {
  if (!user) return null;
  const userData = user.toObject();
  delete userData.password;
  return userData;
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
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
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(req.params.id).select("-password");

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

    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      identification: req.body.identification,
      passport: req.body.passport,
      contractExpiryDate: req.body.contractExpiryDate,
      iban: req.body.iban,
      bankName: req.body.bankName,
      position: req.body.position,
      role: req.body.role,
      mainSalary: req.body.mainSalary,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      file: filePath,
    };

    const newUser = await User.create(userData);
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
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid user ID format",
      });
    }

    // Check authorization
    if (
      req.user.id !== req.params.id &&
      req.user.role !== "Admin" &&
      req.user.role !== "Manager"
    ) {
      return res.status(403).json({
        status: "Error",
        message: "Not authorized to update this user",
      });
    }

    const uploadedFile = req.file;
    const filePath = uploadedFile ? uploadedFile.path : null;

    // Sanitize and validate update data
    const updateData = {
      firstName: req.body.firstName?.trim(),
      lastName: req.body.lastName?.trim(),
      email: req.body.email?.toLowerCase().trim(),
      phone: req.body.phone?.toString().trim(),
      identification: req.body.identification
        ?.toString()
        .replace(/[^0-9]/g, ""),
      passport: req.body.passport?.trim(),
      contractExpiryDate: req.body.contractExpiryDate
        ? new Date(req.body.contractExpiryDate)
        : undefined,
      iban: req.body.iban?.trim().replace(/\s/g, ""),
      bankName: req.body.bankName?.trim(),
      position: req.body.position?.trim(),
      role: req.body.role?.trim(),
      mainSalary: req.body.mainSalary
        ? parseFloat(req.body.mainSalary)
        : undefined,
      file: filePath ?? req.body.file,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Prepare the updated data
    // const updateData = { ...req.body, file: filePath ?? req.body.file };

    // Check if password is included in the request body and hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      updateData.password = hashedPassword;
    }

    // Validate role if being updated
    if (updateData.role) {
      const validRoles = ["Admin", "Manager", "Employee", "Accountant"];
      if (!validRoles.includes(updateData.role)) {
        return res.status(400).json({
          status: "Error",
          message: "Invalid role specified",
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!user) {
      return res.status(404).json({
        status: "Error",
        message: "User not found",
      });
    }

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

// @desc    Update user profile image
// @route   PATCH /api/users/:id/profile-image
// @access  Private
const updateProfileImage = async (req, res) => {
  try {
    const uploadedFile = req.file;
    if (!uploadedFile) {
      return res.status(400).json({
        status: "Error",
        message: "No file uploaded",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { image: uploadedFile.path },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        status: "Error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "Success",
      file: uploadedFile.path,
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

// @desc    Remove profile image
// @route   DELETE /api/users/:id/profile-image
// @access  Private
const removeProfileImage = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { file: null });
    res.status(204).json({ status: "Success", data: null });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
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
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      sameSite: "strict",
    });

    res.status(200).json({
      status: "Success",
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      status: "Error",
      message: "Logout failed",
    });
  }
};

const getAllInvoices = async (req, res) => {
  console.log("In get all employee invoices method >>>>");
  try {
    let status = [];
    switch (req.user.role) {
      case "Admin":
        status = ["pendingAdminReview"];
        break;
      case "Manager":
        status = ["pendingManagerReview"];
        break;
      case "Accountant":
        status = ["approved"];
        break;
    }

    const employeeInvoices = await getEmployeeInvoices([
      ...status,
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

async function getEmployeeInvoices(
  status = ["approved"],
  customDates = undefined
) {
  const query = {
    status: { $in: status },
  };

  // Only add date range if customDates is provided
  if (customDates) {
    query.invoiceDate = {
      $gte: customDates.startDate,
      $lt: customDates.endDate,
    };
  }

  const invoices = await EmployeeInvoice.find(query).populate("user");
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
      deductionDate = null,
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
      deductionDate,
      invoiceAddedBy: req.user.id,
      status,
      file: filePath,
    });

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
    const selectedUsers = JSON.parse(req.body.selectedUsers);
    const { message, title } = req.body;
    const uploadedFile = req.file;
    const filePath = uploadedFile ? uploadedFile.path : null;

    console.log("filePath", filePath);

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
      title,
      file: filePath,
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

// @desc    Fetch sent messages for the currently logged-in user
// @route   GET /api/messages/sent
// @access  Private
const fetchSentMessages = async (req, res) => {
  try {
    // Fetch messages where the current user is the sender
    const messages = await Message.find({
      sender: req.user.id,
    }).populate("receivers", "firstName lastName");

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

// @desc    Fetch received messages for the currently logged-in user
// @route   GET /api/messages/received
// @access  Private
const fetchReceivedMessages = async (req, res) => {
  try {
    // Fetch messages where the current user is in the receivers array
    const messages = await Message.find({
      receivers: req.user.id,
    }).populate("sender", "firstName lastName");

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
  fetchSentMessages,
  getAllInvoices,
  updateInvoiceStatus,
  removeProfileImage,
  fetchReceivedMessages,
  updateProfileImage,
};
