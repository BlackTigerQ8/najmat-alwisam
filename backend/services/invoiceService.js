const DriverInvoice = require("../models/driverInvoiceModel");

const archiveInvoices = async () => {
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

    console.log("Invoices updated successfully");
  } catch (error) {
    console.error("Error updating invoices:", error);
  }
};

module.exports = { archiveInvoices };
