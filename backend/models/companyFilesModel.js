const mongoose = require("mongoose");

const companyFilesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "File name is required"],
  },
  filePath: {
    type: String,
    required: [true],
  },
});

module.exports = mongoose.model("companyFile", companyFilesSchema);
