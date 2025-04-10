import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";
import StatBox from "../../components/StatBox";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchDrivers, fetchDriverSummary } from "../../redux/driversSlice";
import { useEffect } from "react";
import { fetchDriverStatsByMonth } from "../../redux/invoiceSlice";
import PrintIcon from "@mui/icons-material/Print";
import { IconButton } from "@mui/material";
import styles from "../Print.module.css";
import { PrintLogo } from "../PrintLogo";

const calculateTotalStats = (monthlyStats) => {
  return Object.values(monthlyStats).reduce(
    (totals, month) => {
      return {
        totalOrders: totals.totalOrders + (month.totalOrders || 0),
        totalCash: totals.totalCash + (month.totalCash || 0),
      };
    },
    { totalOrders: 0, totalCash: 0 }
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const invoice = useSelector((state) => state.invoice);
  const { status, summary, summaryStatus } = useSelector(
    (state) => state.drivers
  );

  const monthlyStats = invoice.monthlyStats;
  const monthlyStatsStatus = invoice.monthlyStatsStatus;

  const allMonthsTotals = calculateTotalStats(monthlyStats);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const token = localStorage.getItem("token");
    dispatch(fetchDrivers(token));
    dispatch(fetchDriverSummary(token));
    dispatch(fetchDriverStatsByMonth(token));
  }, [dispatch]);

  pulsar.register();
  if (
    status === "loading" ||
    summaryStatus === "loading" ||
    monthlyStatsStatus === "loading"
  ) {
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

  if (
    status === "failed" ||
    summaryStatus === "failed" ||
    monthlyStatsStatus === "failed"
  ) {
    return (
      <Typography variant="h6" color="error">
        Failed to load drivers or summary data.
      </Typography>
    );
  }

  const handlePrint = () => {
    const printContent = document.getElementById("dashboard");

    // Create print-specific styles
    const printStyles = `
      @media print {
        @page {
          size: A4;
          margin: 10mm;
        }
  
        body * {
          visibility: hidden;
        }
  
        #dashboard, #dashboard * {
          visibility: visible;
        }
  
        #dashboard {
          position: absolute;
          left: 0;
          top: 0;
          width: 210mm;  /* A4 width */
          background-color: white !important;
          color: black !important;
        }
  
        /* Force light mode colors for printing */
        #dashboard * {
          color: black !important;
          background-color: white !important;
        }

        .MuiIconButton-root, .header-component {
          display: none !important;
        }
  
        .print-header {
          display: flex !important;
        }
  
        /* Chart container styles */
        #dashboard .MuiBox-root[gridRow="span 2"] {
          height: 40mm !important;
          page-break-inside: avoid;
          break-inside: avoid;
        }
  
        /* Fixed dimensions for charts */
        #dashboard .MuiBox-root[height="250px"] {
          height: 60mm !important;
          width: 170mm !important;
          margin: 0 auto !important;
          page-break-inside: avoid;
          break-inside: avoid;
        }
  
        /* Grid layout adjustments */
        #dashboard .MuiBox-root[display="grid"] {
          display: block !important;
          width: 100% !important;
        }
  
        /* Stat boxes adjustments */
        #dashboard .MuiBox-root[gridColumn="span 4"] {
          width: 33.33% !important;
          float: left !important;
          margin-bottom: 5mm !important;
          height: 25mm !important; 
        }
  
        /* Clear float after stat boxes */
        #dashboard .MuiBox-root[gridColumn="span 12"] {
          clear: both !important;
        }
  
        /* Chart specific adjustments */
        #dashboard .MuiBox-root[gridColumn="span 6"] {
          width: 50% !important;
          margin-bottom: 5mm !important;
          page-break-inside: avoid;
          break-inside: avoid;
        }
  
        /* Force light theme colors for charts */
        .recharts-surface,
        .recharts-layer {
          color: black !important;
        }
  
        /* Ensure text is readable */
        text {
          fill: black !important;
        }
  
        /* Clear margins and padding */
        #dashboard .MuiBox-root {
          margin: 2mm 0 !important;
          padding: 1mm !important;
        }
  
        /* Ensure proper page breaks */
        .page-break {
          page-break-before: always;
        }
      }
    `;

    // Add print styles
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = printStyles;
    document.head.appendChild(styleSheet);

    // Force light mode for printing
    const originalMode = document.body.className;
    document.body.className = document.body.className.replace("dark", "light");

    // Print
    window.print();

    // Restore original mode
    document.body.className = originalMode;

    // Remove print styles
    document.head.removeChild(styleSheet);
  };

  // Current date formatting
  const currentDate = new Date().toLocaleDateString("ar-KW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <Box m="20px" id="dashboard">
      <div
        className={`${styles.headerSection} print-header`}
        style={{ display: "none" }}
      >
        <PrintLogo />
        <div className={styles.companyTitle}>
          مؤسسة نجمة الوسام لتوصيل الطلبات
        </div>
        <div className={styles.currentDate}>{currentDate}</div>
      </div>
      {/* Regular Header - Shown in UI, hidden when printing */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        className="header-component"
      >
        <Header title={t("DASHBOARD")} subtitle={t("dashboardSubtitle")} />
        <IconButton
          onClick={handlePrint}
          sx={{
            backgroundColor: colors.primary[400],
            "&:hover": { backgroundColor: colors.greenAccent[700] },
          }}
        >
          <PrintIcon />
        </IconButton>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <StatBox
            title={summary.mainOrder + summary.additionalOrder}
            subtitle={t("totalOrdersThisMonth")}
            icon={
              <DeliveryDiningOutlinedIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <StatBox
            title={`${summary.totalCash.toLocaleString("en-US", {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })} ${t("kd")}`}
            subtitle={t("totalCashThisMonth")}
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <StatBox
            title={summary.totalHours.toFixed(2)}
            subtitle={t("totalHoursThisMonth")}
            icon={
              <AccessTimeFilledIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 12"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box mt="25px" p="0 30px" alignItems="center">
            <Box>
              <Box display="flex" gap="20px" justifyContent="space-between">
                <Typography
                  variant="h5"
                  fontWeight="600"
                  color={colors.grey[100]}
                >
                  {t("totalCash")}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="600"
                  color={colors.grey[100]}
                >
                  {currentYear} {t("year")}
                </Typography>
              </Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {allMonthsTotals.totalCash.toLocaleString("en-US", {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                {t("kd")}
              </Typography>
            </Box>
            <Box>
              {/* <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton> */}
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart
              isDashboard={true}
              monthlyStats={monthlyStats}
              chartField="totalCash"
              yAxisMin={0}
            />
          </Box>
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 12"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box mt="25px" p="0 30px" alignItems="center">
            <Box>
              <Box display="flex" gap="20px" justifyContent="space-between">
                <Typography
                  variant="h5"
                  fontWeight="600"
                  color={colors.grey[100]}
                >
                  {t("totalOrders")}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="600"
                  color={colors.grey[100]}
                >
                  {currentYear} {t("year")}
                </Typography>
              </Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {allMonthsTotals.totalOrders}
              </Typography>
            </Box>
            <Box>
              {/* <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton> */}
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart
              isDashboard={true}
              monthlyStats={monthlyStats}
              chartField="totalOrders"
              yAxisMin={0}
            />
          </Box>
        </Box>
        <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box mt="25px" p="0 30px" alignItems="center">
            <Box>
              <Box display="flex" gap="20px" justifyContent="space-between">
                <Typography
                  variant="h5"
                  fontWeight="600"
                  color={colors.grey[100]}
                >
                  {t("totalOrders")}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="600"
                  color={colors.grey[100]}
                >
                  {currentYear} {t("year")}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <BarChart
              isDashboard={true}
              monthlyStats={monthlyStats}
              chartField="totalOrders"
            />
          </Box>
        </Box>
        <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box mt="25px" p="0 30px" alignItems="center">
            <Box>
              <Box display="flex" gap="20px" justifyContent="space-between">
                <Typography
                  variant="h5"
                  fontWeight="600"
                  color={colors.grey[100]}
                >
                  {t("totalOrders")}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="600"
                  color={colors.grey[100]}
                >
                  {currentYear} {t("year")}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <PieChart monthlyStats={monthlyStats} chartField="totalOrders" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
