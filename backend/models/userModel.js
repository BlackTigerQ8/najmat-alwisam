const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const USER_ROLES = ["Admin", "Manager", "Employee", "Accountant"];
const USER_POSITIONS = [
  "Administrative",
  "Engineer",
  "Accountant",
  "Representative",
  "MarketingManager",
  "SalesManager",
  "HRManager",
  "ProjectManager",
  "ProductManager",
  "BusinessAnalyst",
  "SoftwareEngineer",
  "WebDeveloper",
  "GraphicDesigner",
  "ContentWriter",
  "CustomerSupportRepresentative",
  "DataAnalyst",
  "OperationsManager",
  "AdminAssistant",
  "TeamLeader",
  "MarketingSpecialist",
  "LegalAdvisor",
  "ITSupportSpecialist",
  "Receptionist",
  "Intern",
  "MarketingSpecialist",
  "LegalAdvisor",
  "ITSupportSpecialist",
  "Receptionist",
  "Intern",
  "Representative",
  "Administrative",
  "Engineer",
  "Accountant",
];

const userSchema = new mongoose.Schema({
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
    unique: true,
    trim: true,
    required: [true, "Email is required for future login"],
  },
  identification: {
    type: Number,
    unique: true,
    required: [true, "Please provide a valid ID"],
  },
  role: {
    type: String,
    enum: USER_ROLES,
    required: true,
  },
  mainSalary: { type: Number, default: 0 },
  passport: {
    type: String,
    unique: true,
    required: [true, "Passport number is required"],
  },
  contractExpiryDate: {
    type: Date,
    required: [true, "Contract expiry date is required"],
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
    enum: USER_POSITIONS,
    required: [true, "Position is required"],
  },
  image: {
    type: String,
  },
  file: {
    type: String,
    required: [false, "File upload is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    // This validator only works on CREATE and SAVE!!!
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
});

// Mongoose middleware to hash the password before saving
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field
  this.confirmPassword = undefined;

  // To remove commas from identification number
  if (this.identification && typeof this.identification === "string") {
    this.identification = this.identification.replace(/,/g, "");
  }
  next();
});

// Pre-save middleware to generate and assign the sequence number
userSchema.pre("save", async function (next) {
  try {
    if (!this.sequenceNumber) {
      // Find the last user in the database
      const lastUser = await mongoose
        .model("User")
        .findOne({}, {}, { sort: { sequenceNumber: -1 } });

      let lastSequenceNumber = 0;
      if (lastUser) {
        lastSequenceNumber = lastUser.sequenceNumber;
      }

      // Calculate the sequence number based on the last one in the database
      this.sequenceNumber = lastSequenceNumber + 1;
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = {
  User: mongoose.model("User", userSchema),
  USER_ROLES,
  USER_POSITIONS,
};
