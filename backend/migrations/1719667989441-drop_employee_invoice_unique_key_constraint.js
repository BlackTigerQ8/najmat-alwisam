const EmployeeInvoice = require("../models/employeeInvoiceModel");
const connectDB = require("../config/db");

/**
 * Make any changes you need to make to the database here
 */
async function up() {
  // Write migration here

  await connectDB();

  await EmployeeInvoice.collection.dropIndex({ sequenceNumber: 1 });
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down() {
  // Write migration here
  await connectDB();
  await EmployeeInvoice.collection.createIndex(
    { sequenceNumber: 1 },
    { unique: true }
  );
}

module.exports = { up, down };
