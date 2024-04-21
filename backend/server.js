const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db.js");
const app = require("./app");
const { addAllDriversNotifications } = require("./services/driverService.js");
const {
  archiveDriverInvoices,
  archiveEmployeeInvoices,
  archivePettyCashInvoices,
} = require("./services/invoiceService.js");

connectDB();

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));

// Running this function every day to update driver documents expiry notifications
setInterval(addAllDriversNotifications, 24 * 60 * 60 * 1000);

// TODO:Commented this since we have a button to reset invoices. Running this function every day to update driver invoices on 1st of every month
//setInterval(archiveDriverInvoices, 24 * 60 * 60 * 1000);

// Running this function every day to update driver invoices on 1st of every month
setInterval(archiveEmployeeInvoices, 24 * 60 * 60 * 1000);

// Running this function every day to update petty cash invoices on 1st of every month
setInterval(archivePettyCashInvoices, 24 * 60 * 60 * 1000);
