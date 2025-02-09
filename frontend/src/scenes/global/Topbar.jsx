import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Box,
  IconButton,
  useTheme,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
} from "@mui/material";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { ColorModeContext, tokens } from "../../theme";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUserRoleFromToken } from "./getUserRoleFromToken";
import { fetchNotifications } from "../../redux/notificationSlice";
import Logo from "../../assets/nj-logo2.png";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../redux/i18nSlice";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user.userInfo._id);
  const userRole =
    useSelector((state) => state.user.userRole) || getUserRoleFromToken();

  const notificationsCount = useSelector((state) => state.notifications.count);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const intervalRef = useRef(null);

  const handleLanguageMenu = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleCloseLanguageMenu = () => {
    setLanguageAnchorEl(null);
  };

  const toggleLanguage = (language) => {
    i18n.changeLanguage(language);
    dispatch(setLanguage(language));
    handleCloseLanguageMenu();
  };

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    // Fetch notifications every 15 minutes
    const fetchNotificationsInterval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 15 * 60 * 1000);

    // Save the interval reference to clear it when the component unmounts
    intervalRef.current = fetchNotificationsInterval;

    return () => {
      // Clear the interval when the component unmounts
      clearInterval(fetchNotificationsInterval);
    };
  }, [dispatch]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    localStorage.clear();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      {/* <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box> */}
      <img src={Logo} width={50} alt="" />

      {/* ICONS */}
      <Box display="flex">
        {/* Language Menu */}
        <Tooltip title={t("changeLanguage")}>
          <IconButton onClick={handleLanguageMenu}>
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

        {/* Dark/Light Mode Toggle */}
        <Tooltip
          title={theme.palette.mode === "dark" ? t("lightMode") : t("darkMode")}
        >
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon />
            ) : (
              <LightModeOutlinedIcon />
            )}
          </IconButton>
        </Tooltip>
        <Link to="/notifications">
          <Tooltip title={t("notifications")}>
            <IconButton>
              <Badge
                badgeContent={
                  notificationsCount ? notificationsCount : undefined
                }
                color="secondary"
                max={50}
              >
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Link>
        {(userRole === "Admin" || userRole === "Manager") && (
          <Tooltip title={t("settings")}>
            <IconButton onClick={() => navigate(`/user-profile/${userId}`)}>
              <SettingsOutlinedIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={t("logout")}>
          <IconButton onClick={handleMenu}>
            <LogoutOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={open}
          onClose={handleClose}
        >
          {/* <MenuItem onClick={handleProfileClick}>Profile</MenuItem> */}
          <MenuItem onClick={handleLogout}>{t("logout")}</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
