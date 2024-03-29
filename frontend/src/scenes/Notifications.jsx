import React, { useEffect, useCallback } from "react";
import { Box, useTheme, Typography } from "@mui/material";
import Header from "../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../theme";
import { useSelector, useDispatch } from "react-redux";
import { fetchDrivers } from "../redux/driversSlice";
import { markAllNotificationsRead } from "../redux/notificationSlice";

const Notifications = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const drivers = useSelector((state) => state.drivers.drivers);

  const getDriverInfo = useCallback(
    (driverId) => drivers.find((driver) => driver._id === driverId),
    [drivers]
  );

  const notifications = useSelector(
    (state) => state.notifications.notifications
  );

  useEffect(() => {
    dispatch(fetchDrivers(token));
  }, [dispatch, token]);

  useEffect(() => {
    if (notifications.length) {
      dispatch(markAllNotificationsRead());
    }
  }, [dispatch, notifications.length]);

  return (
    <Box m="20px">
      <Header title="NOTIFICATIONS" subtitle="Important Notifications Page" />
      {notifications.map((notification, index) => (
        <Accordion defaultExpanded key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color={colors.greenAccent[500]} variant="h5">
              {notification.additionalDetails.fieldName} Expiration Alert!
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {getDriverInfo(notification.driverId).firstName} (Driver){" "}
              {notification.additionalDetails.fieldName} will expire on{" "}
              {new Date(
                notification.additionalDetails.expiryDate
              ).toDateString()}
              .
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Notifications;
