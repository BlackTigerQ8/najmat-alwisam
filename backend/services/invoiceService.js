const DriverInvoice = require("../models/driverInvoiceModel");
const EmployeeInvoice = require("../models/employeeInvoiceModel");
const PettyCash = require("../models/pettyCashModel");

const archiveDriverInvoices = async () => {
  try {
    const currentDate = new Date();

    if (currentDate.getDate() !== 1) return;

    const activeInvoices = await DriverInvoice.find({
      status: { $in: ["pending", "approved"] },
    });

    for (const invoice of activeInvoices) {
      invoice.status = "archived";

      await invoice.save();
    }

    console.log("Driver Invoices updated successfully");
  } catch (error) {
    console.error("Error updating driver invoices:", error);
  }
};

const archiveEmployeeInvoices = async () => {
  try {
    const currentDate = new Date();

    if (currentDate.getDate() !== 1) return;

    const activeInvoices = await EmployeeInvoice.find({
      status: { $in: ["pending", "approved"] },
    });

    for (const invoice of activeInvoices) {
      invoice.status = "archived";

      await invoice.save();
    }

    console.log("Employee invoices updated successfully");
  } catch (error) {
    console.error("Error updating employee invoices:", error);
  }
};

const archivePettyCashInvoices = async () => {
  try {
    const currentDate = new Date();

    if (currentDate.getDate() !== 1) return;

    const activeInvoices = await PettyCash.find({
      status: { $in: ["pending", "approved"] },
    });

    for (const invoice of activeInvoices) {
      invoice.status = "archived";

      await invoice.save();
    }

    console.log("Petty cash invoices updated successfully");
  } catch (error) {
    console.error("Error updating petty cash invoices:", error);
  }
};

module.exports = {
  archiveDriverInvoices,
  archiveEmployeeInvoices,
  archivePettyCashInvoices,
};
