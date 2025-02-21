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
const archiveRoutes = require("./routes/archiveRoutes");
const salaryConfigRoutes = require("./routes/salaryConfigRoutes");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

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
app.use("/api/uploads", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/petty-cash", pettyCash);
app.use("/api/bank-statement", bankStatement);
app.use("/api/spend-types", spendTypeRoutes);
app.use("/api/company-income", companyIncomeRoutes);
app.use("/api/company-files", companyFilesRoutes);
app.use("/api/archives", archiveRoutes);
app.use("/api/salary-config", salaryConfigRoutes);
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Socket.io connection handling
const invoicesNamespace = io.of("/api/invoices");

invoicesNamespace.on("connection", (socket) => {
  console.log("Client connected to invoices namespace");

  socket.on("invoicesReset", (data) => {
    socket.broadcast.emit("invoicesReset", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected from invoices namespace");
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

module.exports = { app, server };
