const mongoose = require("mongoose");
const connectDB = require("./config/db.js");
const CompanyFiles = require("./models/companyFilesModel.js");

const deleteCompanyFiles = async () => {
  try {
    await connectDB();
    console.log("Before deleting company files records");
    await CompanyFiles.deleteMany({});
    console.log("All company files deleted");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

deleteCompanyFiles().then(() => console.log("company files deleted"));
