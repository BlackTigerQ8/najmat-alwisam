const Driver = require("../models/driverModel");
const DriverInvoice = require("../models/driverInvoiceModel");
const Notification = require("../models/notificationModel");
const ReadNotification = require("../models/readNotificationModel");
const { User, USER_ROLES } = require("../models/userModel");
const {
  addSingleDriverNotifications,
  filterDriversByStatus,
} = require("../services/driverService");
const { fetchCurrentMonthPettyCash } = require("./pettyCashController");
const PettyCash = require("../models/pettyCashModel");
const { getMonthDateRange } = require("../utils/date");
const { uniq } = require("lodash");
const driverStatus = require("../constants/driverStatus");

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private/Admin_and_Employee
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await filterDriversByStatus();
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

const getInactiveDrivers = async (req, res) => {
  try {
    const drivers = await filterDriversByStatus(driverStatus.InActive);
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
    const uploadedFile = req.file;
    const filePath = uploadedFile ? uploadedFile.path : null;

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
      file: filePath,
    });

    await newInvoice.save();

    if (isDeductionRequest && req.user.role !== "Admin") {
      const notification = new Notification({
        driverId,
        //heading: `${driver.firstName} ${driver.lastName} Deduction Alert`,
        role: [notification_recipient_role],
        notification_type: "Driver_Deduction",
        // message: `${req.user.firstName} ${req.user.lastName} (${
        //   req.user.role
        // }) has made a deduction request on ${new Date().toDateString()}`,
        additionalDetails: {
          senderName: `${req.user.firstName} ${req.user.lastName}`,
          senderRole: req.user.role,
          targetName: `${driver.firstName} ${driver.lastName}`,
          date: `${new Date().toDateString()}`,
          subType: "Add",
        },
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
    let status = ["visibleToAll"];
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

    // Get current month's date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Build the query to include both current and archived invoices for the current month
    const query = {
      $or: [
        // Include both visibleToAll and visibleToAllArchived status
        {
          status: { $in: ["visibleToAll", "visibleToAllArchived"] },
          invoiceDate: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
        // Other statuses without date filtering
        {
          status: {
            $in: status.filter(
              (s) => !["visibleToAll", "visibleToAllArchived"].includes(s)
            ),
          },
        },
      ],
    };

    console.log("Query date range:", { startOfMonth, endOfMonth });

    const driverInvoices = await DriverInvoice.find(query)
      .populate("driver")
      .sort({ invoiceDate: -1 });

    console.log("Found invoices:", driverInvoices.length);
    console.log("Status filter:", status);

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

const getDriverInvoices = async (
  status = ["visibleToAll", "approved"],
  optionalDates
) => {
  const { startDate, endDate } = getMonthDateRange();

  let startDateForFilter = startDate;
  let endDateForFilter = endDate;
  if (optionalDates?.optionalStartDate) {
    startDateForFilter = new Date(optionalDates?.optionalStartDate);
    startDateForFilter.setHours(0, 0, 0, 0);
  }
  if (optionalDates?.optionalEndDate) {
    endDateForFilter = new Date(optionalDates?.optionalEndDate);
    endDateForFilter.setHours(23, 59, 59, 0);
  }

  const driverInvoices = await DriverInvoice.find({
    status: { $in: status },
    invoiceDate: {
      $gte: startDateForFilter,
      $lte: endDateForFilter,
    },
  }).populate("driver");

  return driverInvoices;
};

// Salary calculations based on the number of main and additional orders for CAR drivers
const carDriverSalary = (orders, salaryMainOrders, salaryAdditionalOrders) => {
  if (orders <= 399) {
    return {
      mainSalary: salaryMainOrders * 0.3,
      additionalSalary: salaryAdditionalOrders * 0.3,
    };
  } else if (orders >= 400 && orders <= 449) {
    return {
      mainSalary: 140,
      additionalSalary: salaryAdditionalOrders * 0.3,
    };
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
    return {
      mainSalary: 50,
      additionalSalary: salaryAdditionalOrders * 0.3,
    };
  } else if (orders <= 300) {
    return {
      mainSalary: 100,
      additionalSalary: salaryAdditionalOrders * 0.3,
    };
  } else if (orders >= 300 && orders <= 349) {
    return {
      mainSalary: 150,
      additionalSalary: salaryAdditionalOrders * 0.3,
    };
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
  try {
    const drivers = await filterDriversByStatus();
    const driversData = {};

    // Get date parameters from query
    const { startDate, endDate } = req.query;
    console.log("Date range:", { startDate, endDate });

    // Initialize data structure for each driver
    for (const driver of drivers) {
      driversData[driver._id] = {
        _id: driver._id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        vehicle: driver.vehicle,
        sequenceNumber: driver.sequenceNumber,
        mainOrder: 0,
        additionalOrder: 0,
        salaryMainOrders: 0,
        salaryAdditionalOrders: 0,
        talabatDeductionAmount: 0,
        companyDeductionAmount: 0,
        pettyCashDeductionAmount: 0,
        cashAmount: 0,
        netSalary: 0,
      };
    }

    // Fetch invoices for the date range
    const invoices = await DriverInvoice.find({
      invoiceDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      status: { $in: ["approved", "visibleToAll"] },
    }).populate("driver");

    console.log(`Found ${invoices.length} invoices`);

    // Aggregate data for each driver
    for (const invoice of invoices) {
      if (!invoice.driver || !invoice.driver._id) continue;

      const driverId = invoice.driver._id.toString();
      if (!driversData[driverId]) continue;

      // Sum up the values
      driversData[driverId].mainOrder += Number(invoice.mainOrder || 0);
      driversData[driverId].additionalOrder += Number(
        invoice.additionalOrder || 0
      );
      driversData[driverId].talabatDeductionAmount += Number(
        invoice.talabatDeductionAmount || 0
      );
      driversData[driverId].companyDeductionAmount += Number(
        invoice.companyDeductionAmount || 0
      );
      driversData[driverId].pettyCashDeductionAmount += Number(
        invoice.pettyCashDeductionAmount || 0
      );
      driversData[driverId].cashAmount += Number(invoice.cashAmount || 0);
    }

    // Calculate salaries for each driver
    for (const driverId in driversData) {
      const driver = driversData[driverId];
      const totalOrders = driver.mainOrder + driver.additionalOrder;

      // Calculate salary based on vehicle type and total orders
      if (driver.vehicle === "Car") {
        if (totalOrders <= 399) {
          driver.salaryMainOrders = driver.mainOrder * 0.3;
          driver.salaryAdditionalOrders = driver.additionalOrder * 0.3;
        } else if (totalOrders <= 449) {
          driver.salaryMainOrders = 140;
          driver.salaryAdditionalOrders = driver.additionalOrder * 0.3;
        } else if (totalOrders <= 599) {
          driver.salaryMainOrders = driver.mainOrder * 0.45;
          driver.salaryAdditionalOrders = driver.additionalOrder * 0.3;
        } else {
          driver.salaryMainOrders = driver.mainOrder * 0.5;
          driver.salaryAdditionalOrders = driver.additionalOrder * 0.3;
        }
      } else {
        // Bike
        if (totalOrders <= 200) {
          driver.salaryMainOrders = 50;
          driver.salaryAdditionalOrders = driver.additionalOrder * 0.3;
        } else if (totalOrders <= 300) {
          driver.salaryMainOrders = 100;
          driver.salaryAdditionalOrders = driver.additionalOrder * 0.3;
        } else if (totalOrders <= 349) {
          driver.salaryMainOrders = 150;
          driver.salaryAdditionalOrders = driver.additionalOrder * 0.3;
        } else if (totalOrders <= 419) {
          driver.salaryMainOrders = driver.mainOrder * 0.45;
          driver.salaryAdditionalOrders = driver.additionalOrder * 0.3;
        } else {
          driver.salaryMainOrders = driver.mainOrder * 0.5;
          driver.salaryAdditionalOrders = driver.additionalOrder * 0.3;
        }
      }

      // Calculate net salary
      driver.netSalary =
        driver.salaryMainOrders +
        driver.salaryAdditionalOrders -
        driver.talabatDeductionAmount -
        driver.companyDeductionAmount -
        driver.pettyCashDeductionAmount;
    }

    // console.log("Processed driver data:", driversData);

    res.status(200).json({
      status: "Success",
      data: {
        driverSalaries: Object.values(driversData),
      },
    });
  } catch (error) {
    console.error("Error in getDriverSalaries:", error);
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
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
        //heading: `${invoice.driver.firstName} ${invoice.driver.lastName} Deduction Alert`,
        role: [role],
        notification_type: "Driver_Deduction",
        // message: `${req.user.firstName} ${req.user.lastName} (${
        //   req.user.role
        // }) has ${
        //   isRejected ? "rejected " : "approved"
        // } deduction request on ${new Date().toDateString()}`,
        additionalDetails: {
          senderName: `${req.user.firstName} ${req.user.lastName}`,
          senderRole: req.user.role,
          targetName: `${invoice.driver.firstName} ${invoice.driver.lastName}`,
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

const resetInvoices = async (req, res) => {
  try {
    // Instead of deleting, just update the status to visibleToAllArchived
    const result = await DriverInvoice.updateMany(
      { status: "visibleToAll" },
      { $set: { status: "visibleToAllArchived" } }
    );

    res.status(200).json({
      status: "Success",
      message: "Invoices reset successfully",
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Reset invoices error:", error);
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const resetDriverInvoices = async (req, res) => {
  try {
    const allDriverInvoices = await getDriverInvoices(["visibleToAll"]);

    const driverInvoices = allDriverInvoices.filter(
      (invoice) => invoice.driver._id.toString() === req.params.driverId
    );

    for (const invoice of driverInvoices) {
      invoice.status = "visibleToAllArchived";
      invoice.archivedAt = new Date();
      invoice.archivedBy = req.user._id;

      await invoice.save();
    }

    res.status(200).json({
      status: "Success",
      data: {
        driverId: req.params.driverId,
        message: "Driver invoice archived",
        invoicesArchived: driverInvoices,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const restoreInvoices = async (req, res) => {
  try {
    // Get current month's first and last day
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Create dates for the current month only
    const firstDay = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const lastDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    // For debugging
    console.log("Date range for restore:", {
      firstDayOfMonth: firstDay.toISOString(),
      lastDayOfMonth: lastDay.toISOString(),
    });

    // Update the status back to visibleToAll for the current month
    const result = await DriverInvoice.updateMany(
      {
        status: "visibleToAllArchived",
        invoiceDate: {
          $gte: firstDay,
          $lte: lastDay,
        },
      },
      {
        $set: {
          status: "visibleToAll",
          restoredAt: new Date(),
          restoredBy: req.user._id,
        },
      }
    );

    console.log("Restore result:", result);

    // Fetch the updated invoices
    const restoredInvoices = await DriverInvoice.find({
      status: "visibleToAll",
      invoiceDate: {
        $gte: firstDay,
        $lte: lastDay,
      },
    }).populate("driver");

    console.log(`Restored ${restoredInvoices.length} invoices`);

    return res.status(200).json({
      status: "Success",
      message: "Invoices restored successfully",
      data: {
        driverInvoices: restoredInvoices,
        modifiedCount: result.modifiedCount,
        dateRange: {
          start: firstDay.toISOString().split("T")[0],
          end: lastDay.toISOString().split("T")[0],
        },
      },
    });
  } catch (error) {
    console.error("Restore invoices error:", error);
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const cleanupOrphanedInvoices = async (req, res) => {
  try {
    console.log("Starting cleanup of orphaned invoices...");

    // 1. Get all unique driver IDs from invoices
    const allInvoices = await DriverInvoice.find({}).lean();
    console.log(`Total invoices found: ${allInvoices.length}`);

    // 2. Get all existing driver IDs
    const existingDrivers = await Driver.find({}, "_id").lean();
    const existingDriverIds = new Set(
      existingDrivers.map((d) => d._id.toString())
    );
    console.log(`Existing drivers count: ${existingDriverIds.size}`);

    // 3. Find invoices with non-existent drivers
    const orphanedInvoices = allInvoices.filter(
      (invoice) =>
        !invoice.driver || !existingDriverIds.has(invoice.driver.toString())
    );
    console.log(`Found ${orphanedInvoices.length} orphaned invoices`);

    // 4. Delete the orphaned invoices
    if (orphanedInvoices.length > 0) {
      const orphanedIds = orphanedInvoices.map((invoice) => invoice._id);
      const result = await DriverInvoice.deleteMany({
        _id: { $in: orphanedIds },
      });

      console.log(`Deleted ${result.deletedCount} orphaned invoices`);

      res.status(200).json({
        status: "Success",
        message: `Successfully deleted ${result.deletedCount} orphaned invoices`,
        data: {
          totalInvoices: allInvoices.length,
          existingDrivers: existingDriverIds.size,
          orphanedCount: orphanedInvoices.length,
          deletedCount: result.deletedCount,
        },
      });
    } else {
      res.status(200).json({
        status: "Success",
        message: "No orphaned invoices found",
        data: {
          totalInvoices: allInvoices.length,
          existingDrivers: existingDriverIds.size,
          orphanedCount: 0,
          deletedCount: 0,
        },
      });
    }
  } catch (error) {
    console.error("Error cleaning up orphaned invoices:", error);
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const fetchArchivedInvoices = async (req, res) => {
  try {
    // First, get all unique driver IDs that have archived invoices
    const uniqueDrivers = await DriverInvoice.distinct("driver", {
      status: "visibleToAllArchived",
    });

    // Get all invoices with status either "visibleToAll" OR "visibleToAllArchived"
    const driverInvoices = await DriverInvoice.find({
      status: {
        $in: ["visibleToAll", "visibleToAllArchived"],
      },
    })
      .populate({
        path: "driver",
        model: "Driver",
        select: "_id firstName lastName phone civilId",
      })
      .sort({ invoiceDate: -1 });

    // Group by driver
    const driverCounts = driverInvoices.reduce((acc, invoice) => {
      const driverId = invoice.driver?._id.toString();
      if (!acc[driverId]) {
        acc[driverId] = {
          driverName: `${invoice.driver?.firstName} ${invoice.driver?.lastName}`,
          count: 0,
        };
      }
      acc[driverId].count++;
      return acc;
    }, {});

    res.status(200).json({
      status: "Success",
      data: {
        driverInvoices,
        summary: {
          totalInvoices: driverInvoices.length,
          uniqueDrivers: uniqueDrivers.length,
          driverCounts,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching archived invoices:", error);
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const filterArchivedInvoices = async (req, res) => {
  try {
    const { startDate, endDate, driverIds } = req.body;

    if (!startDate || !startDate) {
      throw new Error("Required parameters are missing from request body");
    }

    // Build the query
    const query = {
      status: { $in: ["visibleToAllArchived", "visibleToAll"] },
      invoiceDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    // Add driver filter if driverIds are provided
    if (driverIds && driverIds.length > 0) {
      query.driver = { $in: driverIds };
    }

    // const driverInvoices = await getDriverInvoices(
    //   ["visibleToAllArchived", "visibleToAll"],
    //   {
    //     optionalStartDate: startDate,
    //     optionalEndDate: endDate,
    //   }
    // );

    const driverInvoices = await DriverInvoice.find(query)
      .populate({
        path: "driver",
        select: "_id firstName lastName phone civilId",
      })
      .sort({ invoiceDate: -1 });

    res.status(200).json({
      status: "Success",
      data: {
        driverInvoices,
      },
    });
  } catch (error) {
    console.log("Get all archived invoice", error);
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const deactivateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { status: driverStatus.InActive },
      {
        new: true,
        runValidators: true,
      }
    );

    if (driver) {
      const notification = new Notification({
        driverId: req.params.id,
        //heading: `${driver.firstName} ${driver.lastName} Deactivation Alert`,
        role: USER_ROLES,
        notification_type: "Driver_Status_Change",
        // message: `${req.user.firstName} ${req.user.lastName} (${
        //   req.user.role
        // }) has deactivated driver on ${new Date().toDateString()}`,
        additionalDetails: {
          senderName: `${req.user.firstName} ${req.user.lastName}`,
          targetName: `${driver.firstName} ${driver.lastName}`,
          senderRole: req.user.role,
          date: `${new Date().toDateString()}`,
          subType: "Deactivate",
        },
      });

      await notification.save();
    }

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

const activateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { status: driverStatus.Active },
      {
        new: true,
        runValidators: true,
      }
    );

    if (driver) {
      const notification = new Notification({
        driverId: req.params.id,
        //heading: `${driver.firstName} ${driver.lastName} Activation Alert`,
        role: USER_ROLES,
        notification_type: "Driver_Status_Change",
        // message: `${req.user.firstName} ${req.user.lastName} (${
        //   req.user.role
        // }) has activated driver on ${new Date().toDateString()}`,
        additionalDetails: {
          senderName: `${req.user.firstName} ${req.user.lastName}`,
          targetName: `${driver.firstName} ${driver.lastName}`,
          senderRole: req.user.role,
          senderRole: req.user.role,
          date: `${new Date().toDateString()}`,
          subType: "Activate",
        },
      });

      await notification.save();
    }

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

// @desc    Get total orders, cash, and hours
// @route   GET /api/drivers/summary
// @access  Private/Admin_and_Employee
const getDriverSummary = async (req, res) => {
  try {
    const driverInvoices = await getDriverInvoices([
      "approved",
      "visibleToAll",
    ]);

    const result = {
      totalOrders: 0,
      totalCash: 0,
      totalHours: 0,
      talabatDeductionAmount: 0,
      mainOrder: 0,
      additionalOrder: 0,
      companyDeductionAmount: 0,
    };

    for (const invoice of driverInvoices) {
      const {
        mainOrder = 0,
        additionalOrder = 0,
        talabatDeductionAmount = 0,
        companyDeductionAmount = 0,
        hour = 0,
        cash = 0,
      } = invoice;

      result.mainOrder += mainOrder;
      result.additionalOrder += additionalOrder;
      result.talabatDeductionAmount += talabatDeductionAmount;
      result.companyDeductionAmount += companyDeductionAmount;
      result.totalHours += hour;
      result.totalCash += cash;
    }

    res.status(200).json({
      status: "Success",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const getDriverStatsByMonth = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Get start and end of current year
    const yearStart = new Date(currentYear, 0, 1); // January 1st of current year
    const yearEnd = new Date(currentYear, 11, 31); // December 31st of current year

    // Get all invoices for the current year
    const yearInvoices = await DriverInvoice.find({
      invoiceDate: {
        $gte: yearStart,
        $lte: yearEnd,
      },
      status: {
        $in: ["approved", "visibleToAll", "visibleToAllArchived"],
      },
    }).populate("driver");

    // Initialize stats for all months of the current year
    const monthlyStats = {};
    for (let month = 1; month <= 12; month++) {
      monthlyStats[month] = {
        car: { totalOrders: 0, totalCash: 0, totalHours: 0 },
        bike: { totalOrders: 0, totalCash: 0, totalHours: 0 },
        totalOrders: 0,
        totalCash: 0,
      };
    }

    // Process invoices
    yearInvoices.forEach((invoice) => {
      if (!invoice.driver?.vehicle) return;

      const invoiceDate = new Date(invoice.invoiceDate);
      const month = invoiceDate.getMonth() + 1; // Get 1-based month
      const driverType = invoice.driver.vehicle.toLowerCase();

      const orders = (invoice.mainOrder || 0) + (invoice.additionalOrder || 0);
      const cash = invoice.cash || 0;

      // Update vehicle-specific stats
      monthlyStats[month][driverType].totalOrders += orders;
      monthlyStats[month][driverType].totalHours += invoice.hour || 0;
      monthlyStats[month][driverType].totalCash += cash;

      // Update combined totals
      monthlyStats[month].totalOrders += orders;
      monthlyStats[month].totalCash += cash;
    });

    res.status(200).json({
      status: "Success",
      data: monthlyStats,
    });
  } catch (error) {
    console.error("Error in getDriverStatsByMonth:", error);
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// @desc    Clear recent invoices (from last hour)
// @route   DELETE /api/drivers/invoices/recent
// @access  Private/Admin
// const clearRecentInvoices = async (req, res) => {
//   try {
//     // Get current time
//     const now = new Date();

//     // Calculate one hour ago
//     const oneHourAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // Subtract 2 hours in milliseconds

//     // Find and delete invoices created in the last hour
//     const result = await DriverInvoice.deleteMany({
//       invoiceDate: {
//         $gte: oneHourAgo,
//         $lte: now,
//       },
//       status: "visibleToAll", // Only delete active invoices
//     });

//     // Log the time range for debugging
//     console.log("Deleting invoices between:", {
//       from: oneHourAgo.toISOString(),
//       to: now.toISOString(),
//       deletedCount: result.deletedCount,
//     });

//     res.status(200).json({
//       status: "Success",
//       message: "Recent invoices cleared successfully",
//       data: {
//         deletedCount: result.deletedCount,
//         timeRange: {
//           from: oneHourAgo.toISOString(),
//           to: now.toISOString(),
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error clearing recent invoices:", error);
//     res.status(500).json({
//       status: "Error",
//       message: error.message,
//     });
//   }
// };

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
  resetInvoices,
  fetchArchivedInvoices,
  filterArchivedInvoices,
  resetDriverInvoices,
  getInactiveDrivers,
  deactivateDriver,
  activateDriver,
  getDriverSummary,
  getDriverStatsByMonth,
  restoreInvoices,
  cleanupOrphanedInvoices,
  // clearRecentInvoices,
};
