const mongoose = require("mongoose");

const archiveSchema = new mongoose.Schema(
  {
    sequenceNumber: {
      type: Number,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    idNumber: {
      type: Number,
      required: [true, "ID number is required"],
      unique: true,
    },
    vehicle: {
      type: String,
      enum: ["Car", "Bike"],
    },
    workNumber: {
      type: Number,
      required: [true, "Working number is required"],
      unique: true,
    },
    archiveNumber: {
      type: String,
      required: [true, "Archive number is required"],
    },
    uploadedFile: {
      type: String,
      required: [true, "Uploaded file is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate and assign the sequence number
archiveSchema.pre("save", async function (next) {
  try {
    if (!this.sequenceNumber) {
      // Find the last document in the collection
      const lastArchive = await mongoose
        .model("Archive")
        .findOne({}, {}, { sort: { sequenceNumber: -1 } });

      let lastSequenceNumber = 0;
      if (lastArchive) {
        lastSequenceNumber = lastArchive.sequenceNumber;
      }

      // Assign a new sequence number
      this.sequenceNumber = lastSequenceNumber + 1;
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Archive = mongoose.model("Archive", archiveSchema);

module.exports = Archive;
