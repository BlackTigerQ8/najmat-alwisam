import React, { useContext } from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  Grid,
  Container,
  Menu,
  Tooltip,
  IconButton,
  MenuItem,
} from "@mui/material";
import { tokens } from "../../theme";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import deliveryImage from "../../assets/delivery.svg";
import { ColorModeContext } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";

const LandingPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const colorMode = useContext(ColorModeContext);
  const [languageAnchorEl, setLanguageAnchorEl] = React.useState(null);

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

  const features = [
    {
      icon: <LocalShippingOutlinedIcon sx={{ fontSize: 50 }} />,
      title: t("efficientDelivery"),
      description: t("efficientDeliveryDesc"),
    },
    {
      icon: <ReceiptOutlinedIcon sx={{ fontSize: 50 }} />,
      title: t("invoiceManagement"),
      description: t("invoiceManagementDesc"),
    },
    {
      icon: <TrackChangesOutlinedIcon sx={{ fontSize: 50 }} />,
      title: t("driverManagement"),
      description: t("driverManagementDesc"),
    },
  ];

  return (
    <Box>
      {/* Simplified Topbar */}
      <Box
        display="flex"
        justifyContent="flex-end"
        p={2}
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 1000,
          width: "100%",
        }}
      >
        <Box display="flex" gap={1}>
          <Tooltip title={t("changeLanguage")}>
            <IconButton onClick={handleLanguageMenu}>
              <TranslateOutlinedIcon sx={{ color: colors.grey[100] }} />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              theme.palette.mode === "dark" ? t("lightMode") : t("darkMode")
            }
          >
            <IconButton onClick={colorMode.toggleColorMode}>
              {theme.palette.mode === "dark" ? (
                <DarkModeOutlinedIcon sx={{ color: colors.grey[100] }} />
              ) : (
                <LightModeOutlinedIcon sx={{ color: colors.grey[100] }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={t("login")}>
            <IconButton onClick={() => navigate("/login")}>
              <LoginOutlinedIcon sx={{ color: colors.grey[100] }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Menu
        anchorEl={languageAnchorEl}
        open={Boolean(languageAnchorEl)}
        onClose={handleCloseLanguageMenu}
        PaperProps={{
          sx: {
            backgroundColor: colors.primary[400],
            color: colors.grey[100],
          },
        }}
      >
        <MenuItem
          onClick={() => toggleLanguage("en")}
          sx={{
            "&:hover": {
              backgroundColor: colors.primary[300],
            },
          }}
        >
          English
        </MenuItem>
        <MenuItem
          onClick={() => toggleLanguage("ar")}
          sx={{
            "&:hover": {
              backgroundColor: colors.primary[300],
            },
          }}
        >
          العربية
        </MenuItem>
      </Menu>

      {/* Hero Section */}
      <Box
        sx={{
          background: colors.primary[400],
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ p: { xs: 2, md: 4 } }}>
                <Typography
                  variant="h1"
                  color={colors.greenAccent[500]}
                  fontWeight="bold"
                  sx={{
                    mb: 2,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                  }}
                >
                  {t("deliveryManagement")}
                </Typography>
                <Typography
                  variant="h4"
                  color={colors.grey[100]}
                  sx={{ mb: 4, lineHeight: 1.5 }}
                >
                  {t("landingPageHero")}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/login")}
                  sx={{
                    backgroundColor: colors.greenAccent[500],
                    color: colors.primary[500],
                    fontSize: "1.1rem",
                    px: 4,
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: colors.greenAccent[600],
                    },
                  }}
                >
                  {t("getStarted")}
                </Button>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: { xs: "none", md: "block" },
              }}
            >
              <Box
                component="img"
                src={deliveryImage}
                alt="Delivery Management"
                sx={{
                  width: "100%",
                  maxWidth: 500,
                  height: "auto",
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          py: 8,
          backgroundColor: colors.primary[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            color={colors.grey[100]}
            textAlign="center"
            mb={6}
          >
            {t("keyFeatures")}
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    p: 4,
                    height: "100%",
                    backgroundColor: colors.primary[400],
                    borderRadius: 2,
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-10px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: colors.greenAccent[500],
                      mb: 2,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h4"
                    color={colors.grey[100]}
                    textAlign="center"
                    mb={2}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    color={colors.grey[200]}
                    textAlign="center"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          py: 8,
          backgroundColor: colors.primary[400],
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            color={colors.grey[100]}
            mb={3}
            sx={{ lineHeight: 1.4 }}
          >
            {t("readyToStart")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/login")}
            sx={{
              backgroundColor: colors.greenAccent[500],
              color: colors.primary[500],
              fontSize: "1.1rem",
              px: 4,
              py: 1.5,
              "&:hover": {
                backgroundColor: colors.greenAccent[600],
              },
            }}
          >
            {t("startNow")}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
