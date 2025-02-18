import React, { useEffect, useCallback, useState } from "react";
import {
  Box,
  useTheme,
  Typography,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import Header from "../components/Header";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { tokens } from "../theme";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchSentMessages,
  fetchUsers,
  fetchReceivedMessages,
} from "../redux/usersSlice";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import IconButton from "@mui/material/IconButton";
import { toast } from "react-toastify";
const Messages = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const users = useSelector((state) => state.users.users);
  const sentMessages = useSelector((state) => state.users.sentMessages);
  const receivedMessages = useSelector((state) => state.users.receivedMessages);
  const status = useSelector((state) => state.users.status);
  const error = useSelector((state) => state.users.error);
  // const userInfo = useSelector((state) => state.user.userInfo);
  const { t } = useTranslation();
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
  const [searchQuery, setSearchQuery] = useState("");
  const [messageType, setMessageType] = useState("received");

  // Filter messages based on search query
  const filteredMessages =
    messageType === "sent"
      ? sentMessages?.filter((message) =>
          message.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : receivedMessages?.filter((message) =>
          message.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

  // const getUserInfo = useCallback(
  //   (userId) => users.find((user) => user._id === userId),
  //   [users]
  // );

  useEffect(() => {
    dispatch(fetchUsers(token));
    dispatch(fetchSentMessages());
    dispatch(fetchReceivedMessages());
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

  const handleViewFile = (values) => {
    if (!values.file) return;

    // Get the file path
    const fileUrl = `${REACT_APP_API_URL}/${values.file}`;

    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      toast.error(t("noFileAvailable"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  return (
    <Box m="20px">
      <Header title={t("MESSAGES")} subtitle={t("messagesSubtitle")} />

      {/* Message type toggle buttons */}
      <Box mb="20px" display="flex" gap="10px" justifyContent="flex-end">
        <Button
          variant={messageType === "received" ? "contained" : "outlined"}
          onClick={() => setMessageType("received")}
          sx={{
            backgroundColor:
              messageType === "received"
                ? colors.greenAccent[600]
                : "transparent",
            color:
              messageType === "received" ? "white" : colors.greenAccent[600],
            "&:hover": {
              backgroundColor:
                messageType === "received"
                  ? colors.greenAccent[700]
                  : "transparent",
            },
          }}
        >
          {t("receivedMessages")}
        </Button>
        <Button
          variant={messageType === "sent" ? "contained" : "outlined"}
          onClick={() => setMessageType("sent")}
          sx={{
            backgroundColor:
              messageType === "sent" ? colors.greenAccent[600] : "transparent",
            color: messageType === "sent" ? "white" : colors.greenAccent[600],
            "&:hover": {
              backgroundColor:
                messageType === "sent"
                  ? colors.greenAccent[700]
                  : "transparent",
            },
          }}
        >
          {t("sentMessages")}
        </Button>
      </Box>

      {/* Search field */}
      <Box mb="20px">
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t("searchMessagesBySubject")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            ".MuiOutlinedInput-root": {
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.greenAccent[700],
              },
            },
            ".MuiInputLabel-root.Mui-focused": {
              color: colors.greenAccent[100],
            },
          }}
        />
      </Box>

      {/* Messages display */}
      {filteredMessages && filteredMessages.length > 0 ? (
        [...filteredMessages].reverse().map((message, index) => (
          <Accordion defaultExpanded key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                display="flex"
                justifyContent="space-between"
                width="100%"
                alignItems="center"
              >
                <Typography color={colors.greenAccent[500]} variant="h5">
                  {message.title}
                </Typography>
                {message.file && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewFile(message);
                    }}
                    size="small"
                    sx={{ color: colors.greenAccent[500] }}
                  >
                    <PictureAsPdfIcon />
                  </IconButton>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Typography>{message.message}</Typography>
              {/* Show sender for received messages */}
              {messageType === "received" && message.sender && (
                <Typography variant="body2" color="textSecondary">
                  {t("from")}: {message.sender.firstName}{" "}
                  {message.sender.lastName}
                </Typography>
              )}
              {/* Show receivers for sent messages */}
              {messageType === "sent" && message.receivers && (
                <Typography variant="body2" color="textSecondary">
                  {t("to")}:{" "}
                  {message.receivers
                    .map(
                      (receiver) => `${receiver.firstName} ${receiver.lastName}`
                    )
                    .join(", ")}
                </Typography>
              )}
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ marginTop: "10px" }}
              >
                {new Date(message.timestamp).toLocaleString()}
              </Typography>
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
          {searchQuery ? t("noSearchResults") : t("noMessages")}
        </Typography>
      )}
    </Box>
  );
};

export default Messages;
