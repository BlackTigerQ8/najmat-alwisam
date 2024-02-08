const mongoose = require("mongoose");

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
  visa: {
    type: String,
    required: [true, "Please enter VISA number"],
  },
  contractExpiryDate: {
    type: Date,
    required: [true, "Please enter contract number"],
  },
  carInsurance: {
    type: String,
    required: [true, "Car insurance is required"],
  },
  carPlateNumber: {
    type: String,
    required: [true, "Car plate number is required"],
  },
  driverLicense: {
    type: String,
    required: [true, "Driver license is required"],
  },
  workPass: {
    type: String,
    required: [true, "Work pass is required"],
  },
  healthInsuranceDate: {
    type: Date,
    required: [true, "Enter Health Insurance Date"],
  },
  healthInsuranceExpiryDate: {
    type: Date,
    required: [true, "Enter Health Insurance Expiry Date"],
  },
  phoneSerialNumber: {
    type: String,
    required: [true, "Phone Serial Number is required"],
  },
  phoneContractNumber: {
    type: String,
    required: [true, "Phone Contract Number is required"],
  },
  iban: {
    type: Number,
    required: [true, "IBAN is required"],
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
  referenceNumber: {
    type: Number,
    required: [true, "Reference Number is required"],
  },
  mainSalary: { type: Number, default: 0 },
  file: {
    type: String,
    // required: [true, "File upload is required"],
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

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Driver", driverSchema);
