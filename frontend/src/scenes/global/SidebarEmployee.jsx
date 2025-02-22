import React, { useEffect, useRef, useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  Backdrop,
  useMediaQuery,
} from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import AnonImage from "../../assets/profileImage.png";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import { useSelector, useDispatch } from "react-redux";
import { profileImage, removeProfileImage } from "../../redux/userSlice";
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

const SideBarEmployee = () => {
  const imageUploadInput = useRef(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const userInfo = useSelector((state) => state.user.userInfo);
  const userProfileImage =
    useSelector((state) => state.user.userProfileImage) || userInfo.image;
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsCollapsed(!isNonMobile);
  }, [isNonMobile]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    //TODO: Add validation for correct file type upload
    // const formData = new FormData();
    // formData.append("file", file);

    if (
      file?.type === "image/jpeg" ||
      file?.type === "image/jpg" ||
      file?.type === "image/png"
    ) {
      setIsUploading(true); // Show backdrop
      try {
        await dispatch(profileImage(file));
      } finally {
        setIsUploading(false); // Hide backdrop
      }
    } else {
      toast.error(t("invalidFileSelected"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  const handleRemoveImage = async (e) => {
    e.stopPropagation(); // Prevent triggering the file upload click
    setIsUploading(true);
    try {
      await dispatch(removeProfileImage());
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
        open={isUploading}
      >
        <l-pulsar
          size="70"
          speed="1.75"
          color={colors.greenAccent[500]}
        ></l-pulsar>
      </Backdrop>
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
                    {t("Employee")}
                  </Typography>
                  <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                    <MenuOutlinedIcon />
                  </IconButton>
                </Box>
              )}
            </MenuItem>

            {!isCollapsed && (
              <>
                <Box mb="25px">
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                    onClick={() => imageUploadInput.current.click()}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    sx={{ cursor: "pointer" }}
                  >
                    <img
                      alt="profile-user"
                      width="100px"
                      height="100px"
                      src={
                        userProfileImage
                          ? `${process.env.REACT_APP_API_URL}/${userProfileImage}`
                          : AnonImage
                      }
                      style={{
                        borderRadius: "50%",
                        opacity: isHovered ? "0.7" : "1",
                        transition: "opacity 0.3s ease-in-out",
                      }}
                      crossOrigin="anonymous"
                    />
                    {isHovered && (
                      <Box
                        position="absolute"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        width="100px"
                        height="100px"
                        borderRadius="50%"
                        sx={{
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          color: "white",
                          fontSize: "14px",
                          textAlign: "center",
                          padding: "0 10px",
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {userProfileImage
                            ? t("changeImage")
                            : t("uploadImage")}
                        </Typography>

                        {userProfileImage && (
                          <Tooltip title={t("removeImage")} placement="bottom">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the file upload click
                                handleRemoveImage(e);
                              }}
                              sx={{
                                color: "white",
                                "&:hover": {
                                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                                },
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    )}
                  </Box>
                  <input
                    type="file"
                    ref={imageUploadInput}
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                    accept="image/jpeg,image/png,image/jpg"
                  />
                </Box>
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
              </>
            )}

            <Box paddingLeft={isCollapsed ? undefined : "10%"}>
              <Typography
                variant="h6"
                color={colors.greenAccent[500]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                {t("invoices")}
              </Typography>

              <Item
                title={t("invoices")}
                to="/invoices"
                icon={<ReceiptOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
              />
              <Typography
                variant="h6"
                color={colors.greenAccent[500]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                {t("forms")}
              </Typography>
              <Item
                title={t("deductionForm")}
                to="/deduction"
                icon={<MoneyOffIcon />}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
              />
              <Item
                title={t("driversForm")}
                to="/driver-form"
                icon={<PersonAddAltOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
              />
              <Item
                title={t("archiveForm")}
                to="/archive-form"
                icon={<ArchiveOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
              />
              <Typography
                variant="h6"
                color={colors.greenAccent[500]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                {t("contactAndMessages")}
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
                title={t("contact")}
                to="/contact"
                icon={<SendOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
              />
              <Item
                title={t("messages")}
                to="/messages"
                icon={<ForumOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
              />
              <Typography
                variant="h6"
                color={colors.greenAccent[500]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                {t("archive")}
              </Typography>
              <Item
                title={t("companyFiles")}
                to="/company-files"
                icon={<FolderCopyOutlinedIcon />}
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
                title={t("searchingArchive")}
                to="/searching-archive"
                icon={<FindInPageOutlinedIcon />}
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
    </>
  );
};

export default SideBarEmployee;
