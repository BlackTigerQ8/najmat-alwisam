const mongoose = require("mongoose");
const driverStatus = require("../constants/driverStatus");

const driverSchema = new mongoose.Schema({
  sequenceNumber: {
    type: Number,
    unique: true,
  },
  firstName: {
    type: String,
    required: [true, "You need to enter your first name"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "You need to enter your last name"],
    trim: true,
  },
  phone: {
    type: Number,
    unique: true,
    required: [true, "You must enter your phone number"],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  idNumber: {
    type: Number,
    required: [true, "Please provide a valid ID"],
  },
  idExpiryDate: {
    type: Date,
    required: [true, "Please enter ID expiry date"],
  },
  passportNumber: {
    type: String,
    required: [true, "Passport number is required"],
  },
  passportExpiryDate: {
    type: Date,
    required: [true, "Please enter passport expiry date"],
  },
  contractExpiryDate: {
    type: Date,
    required: [true, "Please enter contract number"],
  },
  driverLicenseExpiryDate: {
    type: Date,
    required: [true, "Car insurance is required"],
  },
  carPlateNumber: {
    type: String,
    required: [true, "Car plate number is required"],
  },
  carRegisterationExpiryDate: {
    type: Date,
    required: [true, "Car registeration expiry date is required"],
  },
  workPass: {
    type: String,
  },
  gasCard: {
    type: Number,
    required: [true, "Enter Health Insurance Date"],
  },
  healthInsuranceExpiryDate: {
    type: Date,
    required: [true, "Enter Health Insurance Expiry Date"],
  },
  carType: {
    type: String,
  },
  employeeCompanyNumber: {
    type: String,
    required: [true, "Employee Company Number is required"],
  },
  iban: {
    type: String,
    required: [true, "IBAN is required"],
  },
  bankName: {
    type: String,
    required: [true, "Bank name is required"],
  },
  position: {
    type: String,
    required: [true, "Position is required"],
  },
  vehicle: {
    type: String,
    enum: ["Car", "Bike"],
    required: true,
  },
  contractType: {
    type: String,
    enum: ["Talabat", "Others"],
    required: true,
  },
  talabatId: {
    type: String,
    required: true,
  },
  mainSalary: {
    type: Number,
    default: 0,
    required: [true, "Main salary is required"],
  },
  file: {
    type: String,
    required: [true, "File upload is required"],
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

// Pre-save middleware to generate and assign the sequence number
driverSchema.pre("save", async function (next) {
  try {
    if (!this.sequenceNumber) {
      // Find the last driver in the database
      const lastDriver = await mongoose
        .model("Driver")
        .findOne({}, {}, { sort: { sequenceNumber: -1 } });

      let lastSequenceNumber = 0;
      if (lastDriver) {
        lastSequenceNumber = lastDriver.sequenceNumber;
      }

      // Calculate the sequence number based on the last one in the database
      this.sequenceNumber = lastSequenceNumber + 1;
    }

    if (!this.status) {
      this.status = driverStatus.Active;
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Driver", driverSchema);
