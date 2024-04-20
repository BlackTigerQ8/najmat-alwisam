const Driver = require("../models/driverModel");
const Notification = require("../models/notificationModel");

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
  // Delete existing notifications for the driver
  await Notification.deleteMany({
    driverId: driver._id,
    notification_type: "Driver_Documents_Expiry",
  });

  const {
    idExpiryDate,
    passportExpiryDate,
    contractExpiryDate,
    healthInsuranceExpiryDate,
  } = driver;

  console.log("driver", driver);

  const daysUntilExpiryForIdCard = daysUntilExpiry(idExpiryDate);
  const daysUntilExpiryForPassport = daysUntilExpiry(passportExpiryDate);
  const daysUntilExpiryForContract = daysUntilExpiry(contractExpiryDate);
  const daysUntilExpiryForInsurance = daysUntilExpiry(
    healthInsuranceExpiryDate
  );

  console.log(
    "daysUntilExpiryForIdCard=",
    daysUntilExpiryForIdCard,
    "daysUntilExpiryForPassport=",
    daysUntilExpiryForPassport,
    "daysUntilExpiryForContract=",
    daysUntilExpiryForContract,
    "daysUntilExpiryForInsurance=",
    daysUntilExpiryForInsurance
  );

  if (
    daysUntilExpiryForIdCard > 0 &&
    daysUntilExpiryForIdCard <= NOTIFICATION_THRESHOLD_FOR_EXPIRY
  ) {
    await addNotification({
      driverId: driver._id,
      fieldName: "ID Card",
      expiryDate: idExpiryDate,
    });
  }

  if (
    daysUntilExpiryForPassport > 0 &&
    daysUntilExpiryForPassport <= NOTIFICATION_THRESHOLD_FOR_EXPIRY
  ) {
    await addNotification({
      driverId: driver._id,
      fieldName: "Passport",
      expiryDate: passportExpiryDate,
    });
  }

  if (
    daysUntilExpiryForContract > 0 &&
    daysUntilExpiryForContract <= NOTIFICATION_THRESHOLD_FOR_EXPIRY
  ) {
    await addNotification({
      driverId: driver._id,
      fieldName: "Contract",
      expiryDate: contractExpiryDate,
    });
  }

  if (
    daysUntilExpiryForInsurance > 0 &&
    daysUntilExpiryForInsurance <= NOTIFICATION_THRESHOLD_FOR_EXPIRY
  ) {
    await addNotification({
      driverId: driver._id,
      fieldName: "Health Insurance",
      expiryDate: healthInsuranceExpiryDate,
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
    heading: `${fieldName} Expiration Alert`,
    role: NOTIFICATION_RECIPIENTS,
    notification_type: "Driver_Documents_Expiry",
    message: `${driverName} (Driver) ${fieldName} will expire on ${new Date(
      expiryDate
    ).toDateString()}`,
  });

  await notification.save();
}

module.exports = {
  addAllDriversNotifications,
  addSingleDriverNotifications,
};
