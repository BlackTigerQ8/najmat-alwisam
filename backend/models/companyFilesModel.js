const mongoose = require("mongoose");

const companyFilesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Select a file to upload"],
  },
});

module.exports = mongoose.model("companyFile", companyFilesSchema);
