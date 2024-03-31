import React, { useRef, useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import AnonImage from "../../assets/profileImage.png";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { useDispatch, useSelector } from "react-redux";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import { profileImage } from "../../redux/userSlice";
import { toast } from "react-toastify";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const SidebarA = () => {
  const imageUploadInput = useRef(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const userInfo = useSelector((state) => state.user.userInfo);
  const userProfileImage =
    useSelector((state) => state.user.userProfileImage) || userInfo.image;
  const dispatch = useDispatch();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    //TODO: Add validation for correct file type upload
    // const formData = new FormData();
    // formData.append("file", file);

    if (
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.type === "image/png"
    ) {
      dispatch(profileImage(file));
    } else {
      toast.error("Invalid file selected. Please upload image file", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  return (
    //!important is because I'm overwritting css styles in the pro-sidebar library
    <Box
      sx={{
        height: "140vh",
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  EMPLOYEE
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px" onClick={() => imageUploadInput.current.click()}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={
                    userProfileImage
                      ? `${process.env.REACT_APP_API_URL}/${userProfileImage}`
                      : AnonImage
                  }
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                  crossorigin="anonymous"
                />
              </Box>
              <input
                type="file"
                ref={imageUploadInput}
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {userInfo.firstName}
                  <br />
                  {userInfo.lastName}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {userInfo.role}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
            <Item
              title="Dashboard"
              to="/accountant-dashboard"
              icon={<LibraryBooksOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Employees Salary"
              to="/employees-salary"
              icon={<PointOfSaleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Drivers Salary"
              to="/drivers-salary"
              icon={<PointOfSaleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Deductions"
              to="/deduction"
              icon={<MoneyOffIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Bank Statement"
              to="/bank-statement"
              icon={<MonetizationOnOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Petty Cash"
              to="/petty-cash"
              icon={<AttachMoneyOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Notifications"
              to="/notifications"
              icon={<NotificationsActiveOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Contact"
              to="/contact"
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Spend type"
              to="/spend-type"
              icon={<PointOfSaleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default SidebarA;
