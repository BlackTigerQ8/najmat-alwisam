const Driver = require("../models/driverModel");
const DriverInvoice = require("../models/driverInvoiceModel");
const Notification = require("../models/notificationModel");
const ReadNotification = require("../models/readNotificationModel");
const { User } = require("../models/userModel");
const { addSingleDriverNotifications } = require("../services/driverService");
const { fetchCurrentMonthPettyCash } = require("./pettyCashController");
const PettyCash = require("../models/pettyCashModel");
const { getMonthDateRange } = require("../utils/date");
const { uniq } = require("lodash");

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private/Admin_and_Employee
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json({
      status: "Success",
      data: {
        drivers,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Get driver profile
// @route   GET /api/drivers/:id
// @access  Private
const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    res.status(200).json({
      status: "Success",
      data: {
        driver,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Register a new driver
// @route   POST /api/drivers
// @access  Private/Admin_and_Employee
const createDriver = async (req, res) => {
  try {
    const uploadedFile = req.file;
    const filePath = uploadedFile ? uploadedFile.path : null;

    const newDriver = await Driver.create({ ...req.body, file: filePath });

    res.status(201).json({
      status: "Success",
      data: {
        driver: newDriver,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Update driver profile
// @route   PATCH /api/drivers/:id
// @access  Private
const updateDriver = async (req, res) => {
  try {
    const uploadedFile = req.file;
    const filePath = uploadedFile ? uploadedFile.path : null;

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { ...req.body, file: filePath ?? req.body.file },
      {
        new: true,
        runValidators: true,
      }
    );

    if (driver) await addSingleDriverNotifications(driver);

    res.status(200).json({
      status: "Success",
      data: { driver },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private/Admin_and_Employee
const deleteDriver = async (req, res) => {
  try {
    const driverId = req.params.id;
    const notifications = await Notification.find({ driverId });

    const notificationIds = notifications.map(
      (notification) => notification._id
    );

    await ReadNotification.deleteMany({
      notificationId: { $in: notificationIds },
    });

    await Notification.deleteMany({ driverId });

    await DriverInvoice.deleteMany({ driver: driverId });

    await Driver.findByIdAndDelete(req.params.id);
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

// @desc    Update driver work
// @route   PATCH /api/drivers/:id/invoice
// @access  Private/Admin_Manager_Employee
const createDriverInvoice = async (req, res) => {
  try {
    const {
      driverId,
      hour = 0,
      mainOrder = 0,
      additionalOrder = 0,
      cash = 0,
      additionalSalary = 0,
      deductionReason = "",
      talabatDeductionAmount = 0,
      companyDeductionAmount = 0,
    } = req.body;

    let status = "visibleToAll";
    let notification_recipient_role = undefined;

    const isDeductionRequest =
      deductionReason && (talabatDeductionAmount || companyDeductionAmount);

    if (isDeductionRequest) {
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
    }

    /** All invoices should be set using yesterday's date */
    const currentDate = new Date();
    const invoiceDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

    const driver = await Driver.findById(driverId);

    if (!driver)
      return res.status(404).json({ message: "Driver does not exist" });

    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User does not exist" });

    const newInvoice = new DriverInvoice({
      driver: driverId,
      mainOrder,
      additionalOrder,
      hour,
      cash,
      additionalSalary,
      talabatDeductionAmount,
      companyDeductionAmount,
      deductionReason,
      invoiceDate,
      user: req.user.id,
      status,
    });

    await newInvoice.save();

    if (isDeductionRequest && req.user.role !== "Admin") {
      const notification = new Notification({
        driverId,
        heading: `${driver.firstName} ${driver.lastName} Deduction Alert`,
        role: [notification_recipient_role],
        notification_type: "Driver_Deduction",
        message: `${req.user.firstName} ${req.user.lastName} (${
          req.user.role
        }) has made a deduction request on ${new Date().toDateString()}`,
      });

      await notification.save();
    }

    return res.status(201).json({
      status: "Success",
      data: {
        invoice: { ...newInvoice._doc, driver: { _id: newInvoice.driver } },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const getAllInvoices = async (req, res) => {
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

    const driverInvoices = await getDriverInvoices([status, "visibleToAll"]);

    res.status(200).json({
      status: "Success",
      data: {
        driverInvoices,
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

const getDriverInvoices = async (status = ["visibleToAll", "approved"]) => {
  const { startDate, endDate } = getMonthDateRange();

  const driverInvoices = await DriverInvoice.find({
    status: { $in: status },
    invoiceDate: {
      $gte: startDate,
      $lt: endDate,
    },
  }).populate("driver");

  return driverInvoices;
};

// Salary calculations based on the number of main and additional orders for CAR drivers
const carDriverSalary = (orders, salaryMainOrders, salaryAdditionalOrders) => {
  if (orders <= 399) {
    return { mainSalary: salaryMainOrders * 0.3 };
  } else if (orders >= 400 && orders <= 449) {
    return { mainSalary: 140 };
  } else if (orders >= 450 && orders <= 599) {
    return {
      mainSalary: salaryMainOrders * 0.45,
      additionalSalary: salaryAdditionalOrders * 0.3,
    };
  } else if (orders >= 600) {
    return {
      mainSalary: salaryMainOrders * 0.5,
      additionalSalary: salaryAdditionalOrders * 0.3,
    };
  }
};

// Salary calculations based on the number of main and additional orders for BIKE drivers
const bikeDriverSalary = (
  orders = 0,
  salaryMainOrders = 0,
  salaryAdditionalOrders = 0
) => {
  if (orders <= 200) {
    return { mainSalary: 50 };
  } else if (orders <= 300) {
    return { mainSalary: 100 };
  } else if (orders >= 300 && orders <= 349) {
    return { mainSalary: 150 };
  } else if (orders >= 350 && orders <= 419) {
    return {
      mainSalary: salaryMainOrders * 0.45,
      additionalSalary: salaryAdditionalOrders * 0.3,
    };
  } else if (orders >= 420) {
    return {
      mainSalary: salaryMainOrders * 0.5,
      additionalSalary: salaryAdditionalOrders * 0.3,
    };
  }
};

const getDriverSalaries = async (req, res) => {
  const drivers = await Driver.find({});

  const driversData = {};

  // Check if user already exists in userData, if not, create new entry
  for (const driver of drivers) {
    const driverId = driver._id;

    driversData[driverId] = {
      firstName: driver.firstName,
      lastName: driver.lastName,
      _id: driverId,
      vehicle: driver.vehicle,
      sequenceNumber: driver.sequenceNumber,
      startingSalary: driver.mainSalary,

      mainOrder: 0,
      additionalOrder: 0,

      salaryMainOrders: 0,
      salaryAdditionalOrders: 0,

      talabatDeductionAmount: 0,
      companyDeductionAmount: 0,
      pettyCashDeductionAmount: 0,

      totalInvoices: 0,
    };
  }

  const driverInvoices = await getDriverInvoices(["approved"]);

  console.log("driverInvoices", driverInvoices);

  for (const invoice of driverInvoices) {
    const {
      mainOrder = 0,
      additionalOrder = 0,
      talabatDeductionAmount = 0,
      companyDeductionAmount = 0,
      driver,
    } = invoice;

    const driverData = driversData[driver.id];

    if (!driverData) continue;

    driverData.mainOrder += mainOrder;
    driverData.additionalOrder += additionalOrder;
    driverData.talabatDeductionAmount += talabatDeductionAmount;
    driverData.companyDeductionAmount += companyDeductionAmount;
  }

  const pettyCashResults = await fetchCurrentMonthPettyCash();

  for (const pettyCash of pettyCashResults) {
    if (!pettyCash.deductedFromDriver) continue;

    const driverData = driversData[pettyCash.deductedFromDriver];

    if (!driverData) continue;

    const { cashAmount } = pettyCash;

    driverData.pettyCashDeductionAmount += cashAmount;
  }

  // Calculating salary based on main order and additional order
  for (const driverId of Object.keys(driversData)) {
    const driverData = driversData[driverId];

    if (!driverData) continue;

    const { mainSalary, additionalSalary = 0 } =
      driverData.vehicle === "Car"
        ? carDriverSalary(driverData.mainOrder, driverData.startingSalary)
        : bikeDriverSalary(driverData.mainOrder, driverData.startingSalary);

    driverData.salaryMainOrders = mainSalary;
    driverData.salaryAdditionalOrders = additionalSalary;
  }

  res.status(200).json({
    status: "Success",
    data: {
      driverSalaries: driversData,
    },
  });
};

const overrideDriverSalary = async (req, res) => {
  const {
    mainOrder,
    additionalOrder,
    talabatDeductionAmount,
    companyDeductionAmount,
    driverId,
  } = req.body;

  const driver = await Driver.findById(driverId);

  if (!driver)
    return res.status(404).json({ message: "Driver does not exist" });

  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ message: "User does not exist" });

  const { cash, hour, deductionReason } = await overrideDriverInvoices({
    driverId,
  });

  /** All invoices should be set using yesterday's date */
  const currentDate = new Date();
  const invoiceDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

  const newInvoice = new DriverInvoice({
    driver: driverId,
    mainOrder,
    additionalOrder,
    hour,
    cash,
    talabatDeductionAmount,
    companyDeductionAmount,
    deductionReason,
    invoiceDate,
    user: req.user.id,
    status: "approved",
  });

  await newInvoice.save();

  return res.status(201).json({
    status: "Success",
    data: {
      invoice: newInvoice,
    },
  });

  // TODO: Confirm if petty cash deductions for driver should be overridden or not
  //await overridePettyCashInvoices({ driverId });
};

const overrideDriverInvoices = async ({ driverId }) => {
  const { startDate, endDate } = getMonthDateRange();

  const driverInvoices = await DriverInvoice.find({
    status: { $in: ["approved"] },
    invoiceDate: {
      $gte: startDate,
      $lt: endDate,
    },
    driver: driverId,
  });

  let cash = 0;
  let hour = 0;
  let deductionReason = "";

  for (const invoice of driverInvoices) {
    invoice.status = "overridden";

    cash += invoice.cash || 0;
    hour += invoice.hour || 0;

    if (invoice.deductionReason) {
      deductionReason = invoice.deductionReason;
    }
    await invoice.save();
  }

  return { cash, hour, deductionReason };
};

const overridePettyCashInvoices = async ({ driverId }) => {
  const { startDate, endDate } = getMonthDateRange();

  const driverInvoices = await PettyCash.find({
    status: { $in: ["pending", "approved"] },
    invoiceDate: {
      $gte: startDate,
      $lt: endDate,
    },
    driver: driverId,
  });

  for (const invoice of driverInvoices) {
    invoice.status = "overridden";
    await invoice.save();
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const isRejected = status.toLowerCase().includes("rejected");

    const invoice = await DriverInvoice.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("driver")
      .populate("user");

    console.log("Invoice", invoice);

    let notification_recipient_role = undefined;
    switch (req.user.role) {
      case "Admin":
        notification_recipient_role = isRejected
          ? [invoice.user.role]
          : uniq(["Accountant", invoice.user.role]);
        break;
      case "Manager":
        notification_recipient_role = isRejected
          ? [invoice.user.role]
          : ["Admin"];
        break;
    }

    for (const role of notification_recipient_role) {
      const notification = new Notification({
        forUserId: role === invoice.user.role ? invoice.user._id : undefined,
        heading: `${invoice.driver.firstName} ${invoice.driver.lastName} Deduction Alert`,
        role: [role],
        notification_type: "Driver_Deduction",
        message: `${req.user.firstName} ${req.user.lastName} (${
          req.user.role
        }) has ${
          isRejected ? "rejected " : "approved"
        } deduction request on ${new Date().toDateString()}`,
      });

      console.log("notification", notification);

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
  getAllDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  createDriverInvoice,
  getAllInvoices,
  getDriverSalaries,
  overrideDriverSalary,
  updateInvoiceStatus,
};
