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
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";

const Messages = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const users = useSelector((state) => state.users.users);
  const sentMessages = useSelector((state) => state.users.sentMessages);
  const status = useSelector((state) => state.users.status);
  const error = useSelector((state) => state.users.error);
  const userInfo = useSelector((state) => state.user.userInfo);
  const { t } = useTranslation();

  const getUserInfo = useCallback(
    (userId) => users.find((user) => user._id === userId),
    [users]
  );

  useEffect(() => {
    dispatch(fetchUsers(token));
    dispatch(fetchSentMessages());
  }, [dispatch, token]);

  pulsar.register();
  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <l-pulsar
          size="70"
          speed="1.75"
          color={colors.greenAccent[500]}
        ></l-pulsar>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <Box m="20px">
      <Header title={t("MESSAGES")} subtitle={t("messagesSubtitle")} />
      {sentMessages && sentMessages.length > 0 ? (
        [...sentMessages].reverse().map((message, index) => (
          <Accordion defaultExpanded key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {getUserInfo(message.sender) ? (
                <Typography color={colors.greenAccent[500]} variant="h5">
                  {getUserInfo(message.sender).firstName}{" "}
                  {getUserInfo(message.sender).lastName}
                </Typography>
              ) : (
                <Typography color="error" variant="h5">
                  Unknown Sender
                </Typography>
              )}
            </AccordionSummary>

            <AccordionDetails>
              <Typography>{message.message}</Typography>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "18px",
          }}
        >
          {t("noMessages")}
        </Typography>
      )}
    </Box>
  );
};

export default Messages;
