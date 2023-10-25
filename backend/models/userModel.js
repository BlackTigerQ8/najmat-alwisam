const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
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
  },
  identification: {
    type: Number,
    required: [true, "Please provide a valid ID"],
  },
  role: {
    type: String,
    enum: ["Admin", "Accountant", "Employee"],
    required: true,
  },
  passport: {
    type: String,
    required: [true, "Passport number is required"],
  },
  file: {
    type: String,
    // required: [true, "File upload is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
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
  next();
});

module.exports = mongoose.model("User", userSchema);
