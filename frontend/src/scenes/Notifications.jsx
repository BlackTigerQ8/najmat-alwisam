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

const Notifications = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();

  const notifications = useSelector(
    (state) => state.notifications.notifications
  );

 

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
              {notification.heading}!
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {notification.message}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Notifications;
