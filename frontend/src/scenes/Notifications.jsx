import React, { useEffect } from "react";
import { Box, useTheme, Typography } from "@mui/material";
import Header from "../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../theme";
import { useSelector, useDispatch } from "react-redux";
import { markAllNotificationsRead } from "../redux/notificationSlice";
import { useTranslation } from "react-i18next";

const Notifications = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const notifications = useSelector(
    (state) => state.notifications.notifications
  );

  useEffect(() => {
    if (notifications.length) {
      dispatch(markAllNotificationsRead());
    }
  }, [dispatch, notifications.length]);

  const getNotificationType = (notification) => {
    const { notification_type: type, additionalDetails } = notification;
    const { subType } = additionalDetails;
    if (type === "Driver_Deduction" || type === "Employee_Deduction") {
      return `deduction${subType}`;
    }

    if (type === "New_Message") {
      return "newMessage";
    }

    if (type === "Driver_Status_Change") {
      return subType === "Deactivate" ? "deactivation" : "activation";
    }

    if (type === "Driver_Documents_Expiry") {
      return `${subType}Expiry`;
    }

    if (type === "Invoice_Action") {
      return `${subType}Invoices`;
    }

    return "";
  };

  const getNotificationHeading = (notification) => {
    const type = getNotificationType(notification);
    const { additionalDetails } = notification;

    if (!type) return notification.heading;

    // Create a copy of additionalDetails to avoid modifying the original
    const translatedDetails = { ...additionalDetails };

    // Translate the role if it exists
    if (translatedDetails.senderRole) {
      translatedDetails.senderRole = t(translatedDetails.senderRole);
    }

    return t(`deductionRejectHeading`, { ...translatedDetails });
  };

  const getNotificationMessage = (notification) => {
    const type = getNotificationType(notification);
    const { additionalDetails } = notification;

    if (!type) return notification.heading;

    // Create a copy of additionalDetails to avoid modifying the original
    const translatedDetails = { ...additionalDetails };

    // Translate the role if it exists
    if (translatedDetails.senderRole) {
      translatedDetails.senderRole = t(translatedDetails.senderRole);
    }

    return t(`deductionRejectMessage`, { ...translatedDetails });
  };
  return (
    <Box m="20px">
      <Header title={t("NOTIFICATIONS")} subtitle={t("notificationTitle")} />
      {notifications.map((notification, index) => (
        <Accordion defaultExpanded key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color={colors.greenAccent[500]} variant="h5">
              {getNotificationHeading(notification)}!
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {getNotificationMessage(notification)}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Notifications;
