import React, { useRef, useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { Box, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import { useSelector, useDispatch } from "react-redux";
import { profileImage } from "../../redux/userSlice";
import AnonImage from "../../assets/profileImage.png";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Item = ({ title, to, icon, selected, setSelected, isCollapsed }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Tooltip title={isCollapsed ? title : ""} placement="right">
      <MenuItem
        active={selected === title}
        style={{
          color: colors.grey[100],
        }}
        onClick={() => setSelected(title)}
        icon={icon}
      >
        {!isCollapsed && <Typography>{title}</Typography>}
        <Link to={to} />
      </MenuItem>
    </Tooltip>
  );
};

const SidebarM = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const userInfo = useSelector((state) => state.user.userInfo);
  const imageUploadInput = useRef(null);

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
          color: "#f1994d !important",
        },
        "& .pro-menu-item.active": {
          color: "#f1994d !important",
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
                  {t("Manager")}
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
                  {t(userInfo.role)}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            {/* <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              {t("pages")}
            </Typography>
            <Item
              title={t("manageTeam")}
              to="/team"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title={t("manageDrivers")}
              to="/drivers"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              {t("forms")}
            </Typography>
            <Item
              title={t("profileForm")}
              to="/form"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title={t("driversForm")}
              to="/driver-form"
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title={t("driversInvoices")}
              to="/invoices"
              icon={<ReceiptOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title={t("deductionInvoices")}
              to="/manager-invoices"
              icon={<ReceiptOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title={t("deduction")}
              to="/deduction"
              icon={<MoneyOffIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title={t("contact")}
              to="/contact"
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title={t("messages")}
              to="/messages"
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              {t("notifications")}
            </Typography>
            <Item
              title={t("notifications")}
              to="/notifications"
              icon={<NotificationsActiveOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title={t("invoicesArchive")}
              to="/invoices-archive"
              icon={<ArchiveOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title={t("companyFiles")}
              to="/company-files"
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title={t("deactivatedDrivers")}
              to="/deactivated-drivers"
              icon={<BlockOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default SidebarM;
