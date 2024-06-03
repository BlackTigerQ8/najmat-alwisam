import React, { useState, useEffect, useRef } from "react";
import { Box, IconButton, useTheme, Menu, MenuItem } from "@mui/material";
import { useContext } from "react";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { ColorModeContext, tokens } from "../../theme";
import Badge from "@mui/material/Badge";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUserRoleFromToken } from "./getUserRoleFromToken";
import { fetchNotifications } from "../../redux/notificationSlice";
import Logo from "../../assets/nj-logo2.png";

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

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const intervalRef = useRef(null);

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
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <Link to="/notifications">
          <IconButton>
            <Badge
              badgeContent={notificationsCount ? notificationsCount : undefined}
              color="secondary"
              max={50}
            >
              <NotificationsOutlinedIcon />
            </Badge>
          </IconButton>
        </Link>
        {(userRole === "Admin" || userRole === "Manager") && (
          <IconButton onClick={() => navigate(`/user-profile/${userId}`)}>
            <SettingsOutlinedIcon />
          </IconButton>
        )}
        <IconButton onClick={handleMenu}>
          <PersonOutlinedIcon />
        </IconButton>
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
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
