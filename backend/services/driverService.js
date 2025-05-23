const Driver = require("../models/driverModel");
const Notification = require("../models/notificationModel");
const driverStatus = require("../constants/driverStatus");
const i18next = require("../i18n");

const NOTIFICATION_THRESHOLD_FOR_EXPIRY = 14;
const NOTIFICATION_RECIPIENTS = ["Admin", "Manager", "Employee"];

async function addAllDriversNotifications() {
  try {
    const drivers = await Driver.find();

    for (const driver of drivers) {
      await addSingleDriverNotifications(driver);
    }
  } catch (error) {
    console.error("Error checking expiry notifications:", error);
  }
}

function daysUntilExpiry(expiryDate) {
  const today = new Date();
  return Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
}

async function addSingleDriverNotifications(driver) {
  const { t } = i18next;
  // Delete existing notifications for the driver
  await Notification.deleteMany({
    driverId: driver._id,
    notification_type: "Driver_Documents_Expiry",
  });

  const driverName = `${driver.firstName} ${driver.lastName}`;

  const {
    idExpiryDate,
    passportExpiryDate,
    contractExpiryDate,
    healthInsuranceExpiryDate,
    driverLicenseExpiryDate,
  } = driver;

  const daysUntilExpiryForIdCard = daysUntilExpiry(idExpiryDate);
  const daysUntilExpiryForPassport = daysUntilExpiry(passportExpiryDate);
  const daysUntilExpiryForContract = daysUntilExpiry(contractExpiryDate);
  const daysUntilExpiryForInsurance = daysUntilExpiry(
    healthInsuranceExpiryDate
  );
  const daysUntilExpiryForLicense = daysUntilExpiry(driverLicenseExpiryDate);

  console.log(
    "daysUntilExpiryForIdCard=",
    daysUntilExpiryForIdCard,
    "daysUntilExpiryForPassport=",
    daysUntilExpiryForPassport,
    "daysUntilExpiryForContract=",
    daysUntilExpiryForContract,
    "daysUntilExpiryForInsurance=",
    daysUntilExpiryForInsurance,
    "daysUntilExpiryForLicense=",
    daysUntilExpiryForLicense
  );

  if (
    daysUntilExpiryForIdCard > 0 &&
    daysUntilExpiryForIdCard <= NOTIFICATION_THRESHOLD_FOR_EXPIRY
  ) {
    await addNotification({
      driverId: driver._id,
      fieldName: "civilId",
      expiryDate: idExpiryDate,
      driverName,
    });
  }

  if (
    daysUntilExpiryForPassport > 0 &&
    daysUntilExpiryForPassport <= NOTIFICATION_THRESHOLD_FOR_EXPIRY
  ) {
    await addNotification({
      driverId: driver._id,
      fieldName: "passport",
      expiryDate: passportExpiryDate,
      driverName,
    });
  }

  if (
    daysUntilExpiryForContract > 0 &&
    daysUntilExpiryForContract <= NOTIFICATION_THRESHOLD_FOR_EXPIRY
  ) {
    await addNotification({
      driverId: driver._id,
      fieldName: "contract",
      expiryDate: contractExpiryDate,
      driverName,
    });
  }

  if (
    daysUntilExpiryForInsurance > 0 &&
    daysUntilExpiryForInsurance <= NOTIFICATION_THRESHOLD_FOR_EXPIRY
  ) {
    await addNotification({
      driverId: driver._id,
      fieldName: "healthInsurance",
      expiryDate: healthInsuranceExpiryDate,
      driverName,
    });
  }

  if (
    daysUntilExpiryForLicense > 0 &&
    daysUntilExpiryForLicense <= NOTIFICATION_THRESHOLD_FOR_EXPIRY
  ) {
    await addNotification({
      driverId: driver._id,
      fieldName: "driverLicense",
      expiryDate: driverLicenseExpiryDate,
      driverName,
    });
  }
}

async function addNotification({
  driverId,
  fieldName,
  expiryDate,
  driverName,
}) {
  const notification = new Notification({
    driverId,
    //heading: `${fieldName} Expiration Alert`,
    role: NOTIFICATION_RECIPIENTS,
    notification_type: "Driver_Documents_Expiry",
    // message: `${driverName} ${t("driver")} ${fieldName} ${t(
    //   "willExpireOn"
    // )} ${new Date(expiryDate).toDateString()}`,
    additionalDetails: {
      targetName: `${driverName}`,
      date: `${expiryDate.toDateString()}`,
      subType: fieldName,
    },
  });

  await notification.save();
}

async function filterDriversByStatus(status = driverStatus.Active) {
  const drivers = await Driver.find({ status });

  return drivers;
}

module.exports = {
  addAllDriversNotifications,
  addSingleDriverNotifications,
  filterDriversByStatus,
};
