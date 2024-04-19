const mongoose = require("mongoose");
const connectDB = require("./config/db.js");
const EmployeeInvoice = require("./models/employeeInvoiceModel.js");

const deleteEmployeeInvoices = async () => {
  try {
    await connectDB();
    console.log("Before deleting Employee invoice records");
    await EmployeeInvoice.deleteMany({});
    console.log("All Employee invoices deleted");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

deleteEmployeeInvoices().then(() => console.log("Employee invoices deleted"));
