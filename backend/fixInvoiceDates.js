const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Import the DriverInvoice model
const DriverInvoice = require("./models/driverInvoiceModel");

async function fixInvoiceDates() {
  try {
    console.log("Starting date fix operation...");

    // Get all invoices
    const invoices = await DriverInvoice.find({});
    console.log(`Found ${invoices.length} invoices to process`);

    let updatedCount = 0;

    // Process each invoice
    for (const invoice of invoices) {
      if (invoice.invoiceDate) {
        // Get current date
        const currentDate = new Date(invoice.invoiceDate);

        // Add one day
        const newDate = new Date(
          currentDate.setDate(currentDate.getDate() + 1)
        );

        // Update the invoice
        await DriverInvoice.findByIdAndUpdate(invoice._id, {
          invoiceDate: newDate,
        });

        updatedCount++;

        // Log progress every 100 invoices
        if (updatedCount % 100 === 0) {
          console.log(`Processed ${updatedCount} invoices...`);
        }
      }
    }

    console.log(`Successfully updated ${updatedCount} invoices`);
    console.log("Date fix operation completed!");
  } catch (error) {
    console.error("Error fixing dates:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
}

// Run the fix
fixInvoiceDates();
