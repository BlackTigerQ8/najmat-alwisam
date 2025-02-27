import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, logoutUser } from "../redux/userSlice";
import { tokens } from "../theme";
import { pulsar } from "ldrs";
import Logo from "../assets/nj-logo.png";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTranslation } from "react-i18next";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";

const Login = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const theme = useTheme();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);

  const { status, error } = useSelector((state) => state.user);
  const colors = tokens(theme.palette.mode);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lowercaseCredentials = {
      ...credentials,
      email: credentials.email.toLowerCase(),
    };
    dispatch(loginUser(lowercaseCredentials));
  };

  const handleLanguageMenu = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleCloseLanguageMenu = () => {
    setLanguageAnchorEl(null);
  };

  const toggleLanguage = (language) => {
    i18n.changeLanguage(language);
    handleCloseLanguageMenu();
  };

  useEffect(() => {
    // Function to handle user activity
    const updateLastActivity = () => {
      localStorage.setItem("lastActivity", new Date().getTime());
    };

    // Function to check if user should be logged out
    const checkActivity = () => {
      const lastActivity = localStorage.getItem("lastActivity");
      if (lastActivity) {
        const currentTime = new Date().getTime();
        const inactiveTime = currentTime - parseInt(lastActivity);

        // If inactive for more than 24 hours (in milliseconds)
        if (inactiveTime > 24 * 60 * 60 * 1000) {
          dispatch(logoutUser());
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    };

    // Add event listeners for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      document.addEventListener(event, updateLastActivity);
    });

    // Check activity every minute
    const intervalId = setInterval(checkActivity, 60000);

    // Set initial activity timestamp
    updateLastActivity();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateLastActivity);
      });
      clearInterval(intervalId);
    };
  }, [dispatch]);

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

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      margin="0 1.5rem"
      bgcolor={theme.palette.background.default}
    >
      <img src={Logo} width={isNonMobile ? 600 : 300} alt="Company Logo" />
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        {t("login")}
      </Typography>
      {status === "failed" && (
        <Typography
          // color="error"
          variant="body2"
          sx={{
            backgroundColor: "error.light",
            padding: "10px 20px",
            borderRadius: "4px",
            marginBottom: 3,
          }}
        >
          {/* Translate the error message based on the error type */}
          {error === "Invalid credentials"
            ? t("invalidCredentials")
            : error === "User not found"
            ? t("userNotFound")
            : error === "Network Error"
            ? t("networkError")
            : t("generalError")}
        </Typography>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        style={{ width: "100%", maxWidth: 400 }}
      >
        <TextField
          label={t("email")}
          name="email"
          value={credentials.email}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          fullWidth
          inputProps={{ autoCapitalize: "none" }}
          sx={{
            ".MuiTextField-root": {
              marginBottom: 2,
            },
            ".MuiButton-root": {
              marginTop: 2,
            },
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
        <TextField
          label={t("password")}
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          fullWidth
          sx={{
            ".MuiTextField-root": {
              marginBottom: 2,
            },
            ".MuiButton-root": {
              marginTop: 2,
            },
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
        <Box mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              status === "loading" ||
              !credentials.email ||
              !credentials.password
            }
            fullWidth
            sx={{
              backgroundColor: colors.greenAccent[700],
              "&:hover": {
                backgroundColor: colors.greenAccent[500],
              },
              height: "48px",
              fontSize: "1.1rem",
              textTransform: "none",
            }}
          >
            {status === "loading" ? t("loggingIn") : t("login")}
          </Button>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center">
          {/* Language Menu */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mt={4}
            gap={1}
          >
            <Typography variant="body1">{t("changeLanguage")}:</Typography>
            <Tooltip title={t("changeLanguage")}>
              <IconButton
                onClick={handleLanguageMenu}
                sx={{
                  "&:hover": {
                    backgroundColor: colors.greenAccent[900],
                  },
                }}
              >
                <TranslateOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={languageAnchorEl}
              open={Boolean(languageAnchorEl)}
              onClose={handleCloseLanguageMenu}
            >
              <MenuItem onClick={() => toggleLanguage("en")}>English</MenuItem>
              <MenuItem onClick={() => toggleLanguage("ar")}>العربية</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
