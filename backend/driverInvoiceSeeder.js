const mongoose = require("mongoose");
const connectDB = require("./config/db.js");
const DriverInvoice = require("./models/driverInvoiceModel.js");

const deleteDriverInvoices = async () => {
  try {
    await connectDB();
    console.log("Before deleting driver invoice records");
    await DriverInvoice.deleteMany({});
    console.log("All Driver invoices deleted");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

deleteDriverInvoices().then(() => console.log("Driver invoices deleted"));
