import React, { useEffect, useCallback } from "react";
import { Box, useTheme, Typography } from "@mui/material";
import Header from "../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../theme";
import { useSelector, useDispatch } from "react-redux";
import { fetchSentMessages, fetchUsers } from "../redux/usersSlice";

const Messages = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const users = useSelector((state) => state.users.users);
  const sentMessages = useSelector((state) => state.users.sentMessages);

  const getUserInfo = useCallback(
    (userId) => users.find((user) => user._id === userId),
    [users]
  );

  useEffect(() => {
    dispatch(fetchUsers(token));
    dispatch(fetchSentMessages());
  }, [dispatch, token]);

  return (
    <Box m="20px">
      <Header title="MESSAGES" subtitle="Received Messages Page" />
      {sentMessages.map((message, index) => (
        <Accordion defaultExpanded key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color={colors.greenAccent[500]} variant="h5">
              Expiration Alert!
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Test</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Messages;
