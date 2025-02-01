import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import StatBox from "../../components/StatBox";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchDrivers, fetchDriverSummary } from "../../redux/driversSlice";
import { useEffect } from "react";
import { fetchDriverStatsByMonth } from "../../redux/invoiceSlice";

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

  return (
    <Box m="20px" id="dashboard">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={t("DASHBOARD")} subtitle={t("dashboardSubtitle")} />
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
            title={`${summary.totalCash.toFixed(3)} ${t("kd")}`}
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
            title={summary.totalHours}
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
                {allMonthsTotals.totalCash.toFixed(3)} {t("kd")}
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
      </Box>
    </Box>
  );
};

export default Dashboard;
