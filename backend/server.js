const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");

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

const staticDirectories = [
  "uploads/images",
  "uploads/users/contracts",
  "uploads/drivers/contracts/Others",
  "uploads/drivers/contracts/Talabat",
  "uploads/drivers/invoices",
  "uploads/users/invoices",
];

async function createDirectories(dirs) {
  try {
    for (const dir of dirs) {
      const exists = fs.existsSync(dir);

      if (!exists) {
        fs.mkdirSync(dir, { recursive: true });

        console.log(`Directory ensured: ${dir}`);
      }

      continue;
    }
  } catch (error) {
    console.error(`Error creating directory ${error}`);
  }
}

async function startServer() {
  // Create directories
  await createDirectories(staticDirectories);

  // Set up static file serving
  staticDirectories.forEach((dir) => {
    const route = `/api/${dir}`;
    app.use(route, express.static(dir));
  });

  // Your other app setup code here...

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();

// Running this function every day to update driver documents expiry notifications
setInterval(addAllDriversNotifications, 24 * 60 * 60 * 1000);

// TODO:Commented this since we have a button to reset invoices. Running this function every day to update driver invoices on 1st of every month
//setInterval(archiveDriverInvoices, 24 * 60 * 60 * 1000);

// Running this function every day to update driver invoices on 1st of every month
setInterval(archiveEmployeeInvoices, 24 * 60 * 60 * 1000);

// Running this function every day to update petty cash invoices on 1st of every month
setInterval(archivePettyCashInvoices, 24 * 60 * 60 * 1000);
