import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  useTheme,
  Grid,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  useMediaQuery,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
import { useSelector, useDispatch } from "react-redux";
import { fetchSalaries } from "../redux/driversSlice";
import { fetchSalaries as fetchEmployeesSalaries } from "../redux/usersSlice";
import { pulsar } from "ldrs";
import PrintIcon from "@mui/icons-material/Print";
import { useReactToPrint } from "react-to-print";
import PrintableTable from "./PrintableTable";
import styles from "./Print.module.css";
import { useTranslation } from "react-i18next";
import { fetchPettyCash, searchPettyCash } from "../redux/pettyCashSlice";
import { fetchSalaryConfigs } from "../redux/salaryConfigSlice";

const MonthlySalaryDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const configs = useSelector((state) => state.salaryConfig.configs);
  const driversSalaries = useSelector((state) => state.drivers.salaries);
  const employeesSalaries = useSelector((state) => state.users.salaries);
  const status = useSelector((state) => state.drivers.salariesStatus);
  const error = useSelector((state) => state.drivers.salariesError);
  const { pettyCash } = useSelector((state) => state.pettyCash);
  const componentRef = useRef();
  const [rows, setRows] = useState([]);

  const [dateRange, setDateRange] = useState({
    startYear: new Date().getFullYear(),
    startMonth: new Date().getMonth(),
    startDay: 1,
    endYear: new Date().getFullYear(),
    endMonth: new Date().getMonth(),
    endDay: new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate(),
  });

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getDaysArray = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleDateChange = (field) => (event) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSearch = () => {
    const token = localStorage.getItem("token");

    // Create dates using UTC
    const startDate = new Date(
      Date.UTC(
        dateRange.startYear,
        dateRange.startMonth,
        dateRange.startDay,
        0,
        0,
        0
      )
    );

    const endDate = new Date(
      Date.UTC(
        dateRange.endYear,
        dateRange.endMonth,
        dateRange.endDay,
        23,
        59,
        59
      )
    );

    // Pass the dates in an object, matching the structure used in DriversSalary.jsx
    dispatch(fetchSalaries({ startDate, endDate }));
    dispatch(fetchEmployeesSalaries({ startDate, endDate }));
  };

  useEffect(() => {
    const currentDate = new Date();
    const params = {
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      endDate: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ),
    };

    dispatch(fetchSalaries(params));
    dispatch(fetchEmployeesSalaries(params));
    dispatch(fetchPettyCash({ values: params }));
    dispatch(fetchSalaryConfigs());
  }, [dispatch]);

  useEffect(() => {
    if (driversSalaries.length > 0 && pettyCash.length > 0) {
      const updatedSalaries = driversSalaries.map((driver) => {
        // Get all petty cash entries for this driver
        const driverPettyCashEntries = pettyCash.filter(
          (entry) => entry.deductedFromDriver === driver._id
        );

        // Calculate total petty cash deductions
        const totalPettyCashDeduction = driverPettyCashEntries.reduce(
          (sum, entry) => sum + Number(entry.cashAmount || 0),
          0
        );

        return {
          ...driver,
          pettyCashDeductionAmount: totalPettyCashDeduction,
        };
      });

      setRows(updatedSalaries);
    }
  }, [driversSalaries, pettyCash]);

  // Salary Calculation Utilities
  const calculateSalary = useMemo(() => {
    return {
      forOrders: (orderCount, vehicleType) => {
        const config = configs.find((c) => c.vehicleType === vehicleType);
        if (!config?.rules) return 0;

        const rule = config.rules.find(
          (r) =>
            orderCount >= r.minOrders &&
            orderCount <=
              (r.maxOrders === Infinity ? Number.MAX_SAFE_INTEGER : r.maxOrders)
        );

        return rule
          ? rule.multiplier
            ? orderCount * rule.multiplier
            : rule.fixedAmount
          : 0;
      },

      total: (driver) => {
        if (driver._id === "sum-row") return 0;

        const mainOrdersSalary = calculateSalary.forOrders(
          Number(driver.mainOrder || 0),
          driver.vehicle
        );
        const additionalOrdersSalary = calculateSalary.forOrders(
          Number(driver.additionalOrder || 0),
          driver.vehicle
        );

        return (
          Number(driver.mainSalary || 0) +
          mainOrdersSalary +
          additionalOrdersSalary
        );
      },

      deductions: (driver) => {
        if (driver._id === "sum-row") return 0;

        return (
          Number(driver.talabatDeductionAmount || 0) +
          Number(driver.companyDeductionAmount || 0) +
          Number(driver.pettyCashDeductionAmount || 0)
        );
      },

      net: (driver) => {
        return (
          calculateSalary.total(driver) - calculateSalary.deductions(driver)
        );
      },
    };
  }, [configs]);

  const columns = [
    {
      field: "sequenceNumber",
      headerName: t("no"),
      flex: 0.2,
      renderCell: (params) => {
        if (params.row._id === "sum-row") {
          return "";
        }
        const currentIndex = rows.findIndex(
          (row) => row._id === params.row._id
        );
        return currentIndex + 1;
      },
      sortable: false,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { firstName, lastName } }) => {
        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {firstName} {lastName}
          </Box>
        );
      },
    },
    {
      field: "vehicle",
      headerName: t("vehicle"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const vehicleValue = params.value || "";
        return t(vehicleValue, { defaultValue: vehicleValue });
      },
    },
    {
      field: "mainSalary",
      headerName: t("mainSalary"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => {
        return params.value ? Number(params.value).toFixed(3) : "0.000";
      },
    },
    {
      field: "finalSalary",
      headerName: t("finalSalary"),
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        // For sum row, calculate total from all rows
        if (row._id === "sum-row") {
          const total = rows
            .filter((driver) => driver._id !== "sum-row")
            .reduce((sum, driver) => {
              const ordersSalary = calculateSalary.forOrders(
                Number(driver.mainOrder || 0) +
                  Number(driver.additionalOrder || 0),
                driver.vehicle
              );
              return sum + Number(driver.mainSalary || 0) + ordersSalary;
            }, 0);
          return (
            <Box display="flex" justifyContent="center" borderRadius="4px">
              {total.toFixed(3)}
            </Box>
          );
        }

        // For regular rows, calculate using the salary calculation utility
        const ordersSalary = calculateSalary.forOrders(
          Number(row.mainOrder || 0) + Number(row.additionalOrder || 0),
          row.vehicle
        );
        const finalSalary = (
          Number(row.mainSalary || 0) + ordersSalary
        ).toFixed(3);

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {finalSalary}
          </Box>
        );
      },
    },
    {
      field: "netSalaryAfterDeductions",
      headerName: t("netSalaryAfterDeductions"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const {
          mainSalary,
          talabatDeductionAmount,
          companyDeductionAmount,
          pettyCashDeductionAmount,
        } = params.row;

        const totalDeductions =
          Number(talabatDeductionAmount || 0) +
          Number(companyDeductionAmount || 0) +
          Number(pettyCashDeductionAmount || 0);

        const net = (Number(mainSalary || 0) - totalDeductions).toFixed(3);

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {net}
          </Box>
        );
      },
    },
    {
      field: "cashSalary",
      headerName: t("cashSalary"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        // For sum row
        if (row._id === "sum-row") {
          const totalCashPayment = rows
            .filter((driver) => driver._id !== "sum-row")
            .reduce((sum, driver) => {
              const ordersSalary = calculateSalary.forOrders(
                Number(driver.mainOrder || 0) +
                  Number(driver.additionalOrder || 0),
                driver.vehicle
              );
              return sum + ordersSalary;
            }, 0);

          return (
            <Box display="flex" justifyContent="center" borderRadius="4px">
              {totalCashPayment.toFixed(3)}
            </Box>
          );
        }

        // For regular rows
        const ordersSalary = calculateSalary.forOrders(
          Number(row.mainOrder || 0) + Number(row.additionalOrder || 0),
          row.vehicle
        );

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {ordersSalary.toFixed(3)}
          </Box>
        );
      },
    },
  ];

  const calculateColumnSum = (fieldName) => {
    const sum = driversSalaries.reduce((total, driver) => {
      return total + Number(driver[fieldName] || 0);
    }, 0);
    return sum;
  };

  const summaryCalculations = useMemo(() => {
    if (!driversSalaries?.length || !employeesSalaries?.length) {
      return {
        specialDriver: null,
        bikeDrivers: {
          finalSalary: 0,
          deductions: 0,
          bankTransfer: 0,
          cashPayment: 0,
        },
        allDrivers: {
          finalSalary: 0,
          deductions: 0,
          bankTransfer: 0,
          cashPayment: 0,
          mainSalary: 0,
        },
        employees: {
          finalSalary: 0,
          deductions: 0,
          bankTransfer: 0,
          cashPayment: 0,
          mainSalary: 0,
        },
        total: {
          finalSalary: 0,
          deductions: 0,
          bankTransfer: 0,
          cashPayment: 0,
          mainSalary: 0,
        },
      };
    }

    const bikeDrivers =
      driversSalaries.filter(
        (driver) => driver.vehicle === "Bike" && driver._id !== "sum-row"
      ) || [];
    const carDrivers =
      driversSalaries.filter(
        (driver) => driver.vehicle === "Car" && driver._id !== "sum-row"
      ) || [];
    const employees =
      employeesSalaries.filter((employee) => employee.role !== "Admin") || [];

    // Special bike driver calculations
    const specialDriver = driversSalaries.find(
      (driver) => driver._id === "6772c32da62e5d54cb6ea8dc"
    );
    const specialDriverStats = specialDriver
      ? {
          mainSalary: Number(specialDriver.mainSalary || 0),
          ordersSalary: calculateSalary.forOrders(
            Number(specialDriver.mainOrder || 0) +
              Number(specialDriver.additionalOrder || 0),
            specialDriver.vehicle
          ),
          deductions:
            Number(specialDriver.talabatDeductionAmount || 0) +
            Number(specialDriver.companyDeductionAmount || 0) +
            Number(specialDriver.pettyCashDeductionAmount || 0),
        }
      : null;

    // Calculate stats for each group
    const calculateGroupStats = (drivers) => ({
      mainSalary: drivers.reduce(
        (sum, driver) => sum + Number(driver.mainSalary || 0),
        0
      ),
      ordersSalary: drivers.reduce((sum, driver) => {
        const ordersSalary = calculateSalary.forOrders(
          Number(driver.mainOrder || 0) + Number(driver.additionalOrder || 0),
          driver.vehicle
        );
        return sum + ordersSalary;
      }, 0),
      deductions: drivers.reduce(
        (sum, driver) =>
          sum +
          Number(driver.talabatDeductionAmount || 0) +
          Number(driver.companyDeductionAmount || 0) +
          Number(driver.pettyCashDeductionAmount || 0),
        0
      ),
    });

    const bikeStats = calculateGroupStats(bikeDrivers);
    const carStats = calculateGroupStats(carDrivers);
    const employeeStats = {
      mainSalary: employees.reduce(
        (sum, employee) => sum + Number(employee.mainSalary || 0),
        0
      ),
      deductions: employees.reduce(
        (sum, employee) =>
          sum +
          Number(employee.companyDeductionAmount || 0) +
          Number(employee.pettyCashDeductionAmount || 0),
        0
      ),
    };

    // Calculate totals
    const driversTotal = {
      mainSalary: driversSalaries.reduce(
        (sum, driver) => sum + Number(driver?.mainSalary || 0),
        0
      ),
      ordersSalary: driversSalaries.reduce((sum, driver) => {
        const ordersSalary = calculateSalary.forOrders(
          Number(driver?.mainOrder || 0) + Number(driver?.additionalOrder || 0),
          driver?.vehicle
        );
        return sum + Number(ordersSalary || 0);
      }, 0),
      deductions: driversSalaries.reduce(
        (sum, driver) =>
          sum +
          Number(driver?.talabatDeductionAmount || 0) +
          Number(driver?.companyDeductionAmount || 0) +
          Number(driver?.pettyCashDeductionAmount || 0),
        0
      ),
    };

    // Calculate employees totals
    const employeesTotal = {
      mainSalary: employeesSalaries.reduce(
        (sum, employee) => sum + Number(employee?.mainSalary || 0),
        0
      ),
      deductions: employeesSalaries.reduce(
        (sum, employee) =>
          sum +
          Number(employee?.companyDeductionAmount || 0) +
          Number(employee?.pettyCashDeductionAmount || 0),
        0
      ),
    };

    // Calculate final totals
    const finalTotals = {
      driversMainSalary: driversTotal.mainSalary,
      driversCashPayment: driversTotal.ordersSalary,
      totalBankTransfer:
        driversTotal.mainSalary -
        driversTotal.deductions +
        (employeesTotal.mainSalary - employeesTotal.deductions),
      grandTotal:
        driversTotal.mainSalary +
        driversTotal.ordersSalary +
        employeesTotal.mainSalary,
    };

    return {
      specialDriver: specialDriverStats
        ? {
            mainSalary: specialDriverStats.mainSalary,
            finalSalary:
              specialDriverStats.mainSalary + specialDriverStats.ordersSalary,
            deductions: specialDriverStats.deductions,
            bankTransfer:
              specialDriverStats.mainSalary - specialDriverStats.deductions,
            cashPayment: specialDriverStats.ordersSalary,
          }
        : null,
      bikeDrivers: {
        mainSalary: bikeStats.mainSalary,
        finalSalary: bikeStats.mainSalary + bikeStats.ordersSalary,
        deductions: bikeStats.deductions,
        bankTransfer: bikeStats.mainSalary - bikeStats.deductions,
        cashPayment: bikeStats.ordersSalary,
      },
      allDrivers: {
        mainSalary: driversTotal.mainSalary,
        finalSalary: driversTotal.mainSalary + driversTotal.ordersSalary,
        deductions: driversTotal.deductions,
        bankTransfer: driversTotal.mainSalary - driversTotal.deductions,
        cashPayment: driversTotal.ordersSalary,
      },
      employees: {
        mainSalary: employeeStats.mainSalary,
        finalSalary: employeeStats.mainSalary,
        deductions: employeeStats.deductions,
        bankTransfer: employeeStats.mainSalary - employeeStats.deductions,
        cashPayment: 0,
      },
      total: {
        driversMainSalary: finalTotals.driversMainSalary,
        driversCashPayment: finalTotals.driversCashPayment,
        bankTransfer: finalTotals.totalBankTransfer,
        grandTotal: finalTotals.grandTotal,
      },
    };
  }, [driversSalaries, employeesSalaries, calculateSalary]);

  const totalCashPayment = useMemo(() => {
    // For drivers: only the orders-based salary is paid in cash
    const driversCashPayment = driversSalaries.reduce((sum, driver) => {
      const ordersSalary = calculateSalary.forOrders(
        Number(driver.mainOrder || 0) + Number(driver.additionalOrder || 0),
        driver.vehicle
      );
      return sum + ordersSalary;
    }, 0);

    // Add employees cash payments
    return driversCashPayment + summaryCalculations.employees.cashPayment;
  }, [driversSalaries, summaryCalculations.employees.cashPayment]);

  useEffect(() => {
    if (driversSalaries.length > 0 && pettyCash.length > 0) {
      // First update the salaries with petty cash data
      const updatedSalaries = driversSalaries.map((driver) => {
        const driverPettyCashEntries = pettyCash.filter(
          (entry) => entry.deductedFromDriver === driver._id
        );

        const totalPettyCashDeduction = driverPettyCashEntries.reduce(
          (sum, entry) => sum + Number(entry.cashAmount || 0),
          0
        );

        return {
          ...driver,
          pettyCashDeductionAmount: totalPettyCashDeduction,
        };
      });

      // Create the sum row with updated totals
      const sumRow = {
        _id: "sum-row",
        firstName: t("total"),
        lastName: "",
        vehicle: "",
        mainSalary: calculateColumnSum("mainSalary"),
        mainOrder: calculateColumnSum("mainOrder"),
        additionalOrder: calculateColumnSum("additionalOrder"),
        talabatDeductionAmount: calculateColumnSum("talabatDeductionAmount"),
        companyDeductionAmount: calculateColumnSum("companyDeductionAmount"),
        pettyCashDeductionAmount: calculateColumnSum(
          "pettyCashDeductionAmount"
        ),
        salaryMainOrders: calculateColumnSum("salaryMainOrders"),
        salaryAdditionalOrders: calculateColumnSum("salaryAdditionalOrders"),
        cashAmount: calculateColumnSum("cashAmount"),
        netSalary: calculateColumnSum("netSalary"),
        remarks: "",
        actions: "",

        // Add any other fields that need to be summed
      };

      // Set the rows with both updated salaries and sum row
      setRows([...updatedSalaries, sumRow]);
    }
  }, [driversSalaries, pettyCash, t]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Drivers Salary Report",
  });

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

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title={t("driversSalaryDetailsTitle")}
          subtitle={t("driversSalaryDetailsSubtitle")}
        />
      </Box>
      {/* Add date controls */}
      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="flex-start"
        gap={2}
        mb={2}
        mt={2}
      >
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Start Date Controls */}
          <Box display="flex">
            <FormControl sx={{ minWidth: 120, mr: 1 }}>
              <Select
                value={dateRange.startDay}
                onChange={handleDateChange("startDay")}
              >
                {getDaysArray(dateRange.startYear, dateRange.startMonth).map(
                  (day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120, mr: 1 }}>
              <InputLabel>{t("startMonth")}</InputLabel>
              <Select
                value={dateRange.startMonth}
                onChange={handleDateChange("startMonth")}
                label={t("startMonth")}
              >
                {[...Array(12).keys()].map((month) => (
                  <MenuItem key={month} value={month}>
                    {new Date(0, month).toLocaleString("default", {
                      month: "long",
                    })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="number"
              label={t("startYear")}
              value={dateRange.startYear}
              onChange={handleDateChange("startYear")}
              sx={{ width: 100 }}
            />
          </Box>

          {/* End Date Controls */}
          <Box>
            <FormControl sx={{ minWidth: 120, mr: 1 }}>
              <Select
                value={dateRange.endDay}
                onChange={handleDateChange("endDay")}
              >
                {getDaysArray(dateRange.endYear, dateRange.endMonth).map(
                  (day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120, mr: 1 }}>
              <InputLabel>{t("endMonth")}</InputLabel>
              <Select
                value={dateRange.endMonth}
                onChange={handleDateChange("endMonth")}
                label={t("endMonth")}
              >
                {[...Array(12).keys()].map((month) => (
                  <MenuItem key={month} value={month}>
                    {new Date(0, month).toLocaleString("default", {
                      month: "long",
                    })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="number"
              label={t("endYear")}
              value={dateRange.endYear}
              onChange={handleDateChange("endYear")}
              sx={{ width: 100 }}
            />
          </Box>
        </Box>
        <Button
          onClick={handleSearch}
          color="secondary"
          variant="contained"
          sx={{
            height: "fit-content",
            alignSelf: "flex-end",
            height: "50px",
            px: 4,
          }}
        >
          {t("search")}
        </Button>
      </Box>
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handlePrint}
          startIcon={<PrintIcon />}
          sx={{
            backgroundColor: colors.blueAccent[600],
            "&:hover": { backgroundColor: colors.blueAccent[500] },
          }}
        >
          {t("print")}
        </Button>
      </Box>

      {/* DataGrid */}
      <Box
        mt="40px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          className={styles.grid}
          getRowClassName={(params) =>
            params.row._id === "sum-row" ? `sum-row-highlight` : ""
          }
          experimentalFeatures={{ newEditingApi: true }}
          sx={{
            "& .sum-row-highlight": {
              bgcolor: colors.greenAccent[700],
              fontWeight: "bold",
              fontSize: "1rem",
              "&:hover": {
                bgcolor: colors.greenAccent[600],
              },
              "& .MuiDataGrid-cell": {
                color: colors.grey[100],
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: colors.blueAccent[700],
                borderBottom: "none",
              },
            },
          }}
        />
      </Box>

      {/* Summary Section */}
      <Box
        mt="20px"
        p="20px"
        backgroundColor={colors.blueAccent[700]}
        borderRadius="4px"
      >
        <Grid container spacing={3}>
          {/* Special Bike Driver Summary */}
          {summaryCalculations?.specialDriver && (
            <Grid item xs={12}>
              <Box
                backgroundColor={colors.primary[400]}
                p="15px"
                borderRadius="4px"
                textAlign="center"
              >
                <Typography
                  variant="h6"
                  color={colors.greenAccent[500]}
                  mb="10px"
                  fontSize="1.2rem"
                  sx={{
                    borderBottom: `2px solid ${colors.grey[400]}`,
                    width: "30%",
                    margin: "10px auto",
                  }}
                >
                  {t("specialBikeDriverSummary")}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                    <Typography variant="body1" gutterBottom>
                      {t("mainSalary")}
                    </Typography>
                    <Typography variant="h6">
                      {(
                        summaryCalculations?.specialDriver?.mainSalary || 0
                      ).toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                    <Typography variant="body1" gutterBottom>
                      {t("deductions")}
                    </Typography>
                    <Typography variant="h6">
                      {(
                        summaryCalculations?.specialDriver?.deductions || 0
                      ).toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                    <Typography variant="body1" gutterBottom>
                      {t("netSalaryAfterDeductions")}
                    </Typography>
                    <Typography variant="h6">
                      {(
                        summaryCalculations?.specialDriver?.bankTransfer || 0
                      ).toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                    <Typography variant="body1" gutterBottom>
                      {t("cashSalary")}
                    </Typography>
                    <Typography variant="h6">
                      {summaryCalculations.bikeDrivers?.cashPayment?.toFixed(3)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}

          {/* All Bike Drivers Summary */}
          <Grid item xs={12}>
            <Box
              backgroundColor={colors.primary[400]}
              p="15px"
              borderRadius="4px"
            >
              <Typography
                variant="h6"
                color={colors.greenAccent[500]}
                mb="10px"
                fontSize="1.2rem"
                textAlign="center"
                sx={{
                  borderBottom: `2px solid ${colors.grey[400]}`,
                  width: "30%",
                  margin: "10px auto",
                }}
              >
                {t("allBikeDriversSummary")}
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("mainSalary")}
                  </Typography>
                  <Typography variant="h6">
                    {(
                      summaryCalculations?.bikeDrivers?.mainSalary || 0
                    ).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("deductions")}
                  </Typography>
                  <Typography variant="h6">
                    {(
                      summaryCalculations?.bikeDrivers?.deductions || 0
                    ).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("netSalaryAfterDeductions")}
                  </Typography>
                  <Typography variant="h6">
                    {(
                      summaryCalculations?.bikeDrivers?.bankTransfer || 0
                    ).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("cashPayment")}
                  </Typography>
                  <Typography variant="h6">
                    {(
                      summaryCalculations?.bikeDrivers?.cashPayment || 0
                    ).toFixed(3)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* All Drivers Summary */}
          <Grid item xs={12}>
            <Box
              backgroundColor={colors.primary[400]}
              p="15px"
              borderRadius="4px"
            >
              <Typography
                variant="h6"
                color={colors.greenAccent[500]}
                mb="10px"
                fontSize="1.2rem"
                textAlign="center"
                sx={{
                  borderBottom: `2px solid ${colors.grey[400]}`,
                  width: "30%",
                  margin: "10px auto",
                }}
              >
                {t("allDriversSummary")}
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("mainSalary")}
                  </Typography>
                  <Typography variant="h6">
                    {(summaryCalculations?.allDrivers?.mainSalary || 0).toFixed(
                      3
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("deductions")}
                  </Typography>
                  <Typography variant="h6">
                    {(summaryCalculations?.allDrivers?.deductions || 0).toFixed(
                      3
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("netSalaryAfterDeductions")}
                  </Typography>
                  <Typography variant="h6">
                    {(
                      summaryCalculations?.allDrivers?.bankTransfer || 0
                    ).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("cashPayment")}
                  </Typography>
                  <Typography variant="h6">
                    {(
                      summaryCalculations?.allDrivers?.cashPayment || 0
                    ).toFixed(3)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* All Employees and Drivers Summary */}
          <Grid item xs={12}>
            <Box
              backgroundColor={colors.primary[400]}
              p="15px"
              borderRadius="4px"
            >
              <Typography
                variant="h6"
                color={colors.greenAccent[500]}
                mb="10px"
                fontSize="1.2rem"
                textAlign="center"
                sx={{
                  borderBottom: `2px solid ${colors.grey[400]}`,
                  width: "30%",
                  margin: "10px auto",
                }}
              >
                {t("allEmployeesSummary")}
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("mainSalary")}
                  </Typography>
                  <Typography variant="h6">
                    {(summaryCalculations?.employees?.mainSalary || 0).toFixed(
                      3
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("deductions")}
                  </Typography>
                  <Typography variant="h6">
                    {(summaryCalculations?.employees?.deductions || 0).toFixed(
                      3
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("netSalaryAfterDeductions")}
                  </Typography>
                  <Typography variant="h6">
                    {(
                      summaryCalculations?.employees?.bankTransfer || 0
                    ).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("cashPayment")}
                  </Typography>
                  <Typography variant="h6">
                    {(summaryCalculations?.employees?.cashPayment || 0).toFixed(
                      3
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Final Summary */}
          <Grid item xs={12}>
            <Box
              backgroundColor={colors.primary[400]}
              p="15px"
              borderRadius="4px"
            >
              <Typography
                variant="h6"
                color={colors.greenAccent[500]}
                mb="10px"
                fontSize="1.2rem"
                textAlign="center"
                sx={{
                  borderBottom: `2px solid ${colors.grey[400]}`,
                  width: "30%",
                  margin: "10px auto",
                }}
              >
                {t("finalSummary")}
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("totalDriversNetSalary")}
                  </Typography>
                  <Typography variant="h6">
                    {(
                      summaryCalculations?.allDrivers?.bankTransfer || 0
                    ).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("totalDriversCashPayment")}
                  </Typography>
                  <Typography variant="h6">
                    {(
                      summaryCalculations?.allDrivers?.cashPayment || 0
                    ).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("totalBankTransfer")}
                  </Typography>
                  <Typography variant="h6">
                    {(summaryCalculations?.total?.bankTransfer || 0).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("grandTotal")}
                  </Typography>
                  <Typography variant="h6">
                    {(summaryCalculations?.total?.grandTotal || 0).toFixed(3)}
                  </Typography>
                </Grid>
                {/* Add new row for combined totals */}
                <Grid item xs={12} sm={6} sx={{ textAlign: "center" }}>
                  <Typography
                    color={colors.greenAccent[500]}
                    fontSize={16}
                    fontWeight="bold"
                  >
                    {t("totalBankTransferAllStaff")} <br />
                    {(summaryCalculations?.total?.bankTransfer).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ textAlign: "center" }}>
                  <Typography
                    color={colors.greenAccent[500]}
                    fontSize={16}
                    fontWeight="bold"
                  >
                    {t("totalCashPaymentAllStaff")} <br />
                    {totalCashPayment?.toFixed(3)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
      {/* Add PrintableTable component */}
      <PrintableTable
        rows={rows}
        columns={columns}
        ref={componentRef}
        orientation="landscape"
        summary={{
          totalDriversNetSalary:
            summaryCalculations.allDrivers.driversMainSalary,
          totalDriversCashPayment:
            summaryCalculations.allDrivers.driversCashPayment,
          totalBankTransfer:
            summaryCalculations.allDrivers.bankTransfer -
            summaryCalculations.allDrivers.cashPayment,
          grandTotal: summaryCalculations.total.grandTotal,
          totalBankTransferAllStaff:
            summaryCalculations.total.totalBankTransfer -
            summaryCalculations.total.driversCashPayment,
          totalCashPaymentAllStaff: totalCashPayment,
        }}
      />
    </Box>
  );
};

export default MonthlySalaryDetails;
