const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const userRouter = require("./routes/userRoutes");
const driverRoutes = require("./routes/driverRoutes");
const driverInvoiceRoutes = require("./routes/driverInvoiceRoutes");
const { router: uploadRoutes } = require("./routes/uploadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const pettyCash = require("./routes/pettyCashRoutes");
const companyIncomeRoutes = require("./routes/companyIncomeRoutes");
const bankStatement = require("./routes/bankStatementRoutes");
const spendTypeRoutes = require("./routes/spendTypeRoutes");
const companyFilesRoutes = require("./routes/companyFilesRoutes");

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

///// MIDDLEWARE /////
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/users", userRouter);
app.use("/api/drivers", driverRoutes);
app.use("/api/driver-invoice", driverInvoiceRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/petty-cash", pettyCash);
app.use("/api/bank-statement", bankStatement);
app.use("/api/spend-types", spendTypeRoutes);
app.use("/api/company-income", companyIncomeRoutes);
app.use("/api/company-files", companyFilesRoutes);

module.exports = app;
