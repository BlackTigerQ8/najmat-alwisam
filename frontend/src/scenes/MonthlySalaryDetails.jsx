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
  const componentRef = useRef();
  const [rows, setRows] = useState([]);
  const [gridState, setGridState] = useState({
    rowModifications: {},
    editedRows: {},
  });

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
  }, [dispatch]);

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

    dispatch(fetchEmployeesSalaries(params));
  }, [dispatch]);

  // Salary Calculation Utilities
  const calculateSalary = {
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
      return calculateSalary.total(driver) - calculateSalary.deductions(driver);
    },
  };

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
      renderCell: ({
        row: {
          mainSalary,
          talabatDeductionAmount,
          companyDeductionAmount,
          pettyCashDeductionAmount,
        },
      }) => {
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

  //  Calculations for Summary Section
  const specialBikeDriverStats = useMemo(() => {
    const specialDriver = driversSalaries.find(
      (driver) => driver._id === "6772c32da62e5d54cb6ea8dc"
    );
    if (!specialDriver) return null;

    const ordersSalary = calculateSalary.forOrders(
      Number(specialDriver.mainOrder || 0) +
        Number(specialDriver.additionalOrder || 0),
      specialDriver.vehicle
    );
    const finalSalary = Number(specialDriver.mainSalary || 0) + ordersSalary;

    const totalDeductions =
      Number(specialDriver.talabatDeductionAmount || 0) +
      Number(specialDriver.companyDeductionAmount || 0) +
      Number(specialDriver.pettyCashDeductionAmount || 0);

    const bankTransfer =
      Number(specialDriver.mainSalary || 0) - totalDeductions;
    const cashSalary = finalSalary - Number(specialDriver.mainSalary || 0);

    return {
      mainOrder: Number(specialDriver.mainOrder || 0),
      additionalOrder: Number(specialDriver.additionalOrder || 0),
      mainSalary: Number(specialDriver.mainSalary || 0),
      finalSalary,
      deductions: totalDeductions,
      bankTransfer,
      cashPayment: cashSalary,
    };
  }, [driversSalaries]);

  const allBikeDriversStats = useMemo(() => {
    const bikeDrivers = driversSalaries.filter(
      (driver) => driver.vehicle === "Bike"
    );

    // Calculate all the values first
    const mainOrder = bikeDrivers.reduce(
      (sum, driver) => sum + Number(driver.mainOrder || 0),
      0
    );

    const additionalOrder = bikeDrivers.reduce(
      (sum, driver) => sum + Number(driver.additionalOrder || 0),
      0
    );

    const mainSalary = bikeDrivers.reduce(
      (sum, driver) => sum + Number(driver.mainSalary || 0),
      0
    );

    const finalSalary = bikeDrivers.reduce((sum, driver) => {
      const ordersSalary = calculateSalary.forOrders(
        Number(driver.mainOrder || 0) + Number(driver.additionalOrder || 0),
        driver.vehicle
      );
      return sum + Number(driver.mainSalary || 0) + ordersSalary;
    }, 0);

    const deductions = bikeDrivers.reduce(
      (sum, driver) =>
        sum +
        Number(driver.talabatDeductionAmount || 0) +
        Number(driver.companyDeductionAmount || 0) +
        Number(driver.pettyCashDeductionAmount || 0),
      0
    );

    const bankTransfer = bikeDrivers.reduce((sum, driver) => {
      const totalDeductions =
        Number(driver.talabatDeductionAmount || 0) +
        Number(driver.companyDeductionAmount || 0) +
        Number(driver.pettyCashDeductionAmount || 0);
      return sum + (Number(driver.mainSalary || 0) - totalDeductions);
    }, 0);

    const cashPayment = bikeDrivers.reduce((sum, driver) => {
      const ordersSalary = calculateSalary.forOrders(
        Number(driver.mainOrder || 0) + Number(driver.additionalOrder || 0),
        driver.vehicle
      );
      return sum + ordersSalary;
    }, 0);

    // Return all calculated values
    return {
      mainOrder,
      additionalOrder,
      mainSalary,
      finalSalary,
      deductions,
      bankTransfer,
      cashPayment,
    };
  }, [driversSalaries]);

  const allDriversStats = useMemo(() => {
    return {
      mainOrder: driversSalaries.reduce(
        (sum, driver) => sum + Number(driver.mainOrder || 0),
        0
      ),
      additionalOrder: driversSalaries.reduce(
        (sum, driver) => sum + Number(driver.additionalOrder || 0),
        0
      ),
      mainSalary: driversSalaries.reduce(
        (sum, driver) => sum + Number(driver.mainSalary || 0),
        0
      ),
      finalSalary: driversSalaries.reduce((sum, driver) => {
        const ordersSalary = calculateSalary.forOrders(
          Number(driver.mainOrder || 0) + Number(driver.additionalOrder || 0),
          driver.vehicle
        );
        return sum + Number(driver.mainSalary || 0) + ordersSalary;
      }, 0),
      deductions: driversSalaries.reduce(
        (sum, driver) =>
          sum +
          Number(driver.talabatDeductionAmount || 0) +
          Number(driver.companyDeductionAmount || 0) +
          Number(driver.pettyCashDeductionAmount || 0),
        0
      ),
      bankTransfer: driversSalaries.reduce((sum, driver) => {
        // Calculate total deductions
        const totalDeductions =
          Number(driver.talabatDeductionAmount || 0) +
          Number(driver.companyDeductionAmount || 0) +
          Number(driver.pettyCashDeductionAmount || 0);

        // Bank transfer should be mainSalary minus deductions
        // Orders-based salary is paid in cash, so it's not included in bank transfer
        return sum + (Number(driver.mainSalary || 0) - totalDeductions);
      }, 0),

      cashPayment: driversSalaries.reduce((sum, driver) => {
        // Cash payment is only the orders-based salary
        const ordersSalary = calculateSalary.forOrders(
          Number(driver.mainOrder || 0) + Number(driver.additionalOrder || 0),
          driver.vehicle
        );
        return sum + ordersSalary;
      }, 0),
    };
  }, [driversSalaries]);

  const allEmployeesStats = useMemo(() => {
    const employees = employeesSalaries.filter(
      (employee) => employee.role !== "Admin"
    );

    return {
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
      netSalary: employees.reduce((sum, employee) => {
        const finalSalary = Number(employee.mainSalary || 0);

        const totalDeductions =
          Number(employee.companyDeductionAmount || 0) +
          Number(employee.pettyCashDeductionAmount || 0);
        return sum + (finalSalary - totalDeductions);
      }, 0),
      cashPayment: employees.reduce((sum, employee) => {
        const finalSalary = Number(employee.mainSalary || 0);
        return sum + (finalSalary - Number(employee.mainSalary || 0));
      }, 0),
    };
  }, [employeesSalaries]);

  const totalNetSalary = useMemo(() => {
    const driversTotal = driversSalaries.reduce((sum, driver) => {
      const ordersSalary = calculateSalary.forOrders(
        Number(driver.mainOrder || 0) + Number(driver.additionalOrder || 0),
        driver.vehicle
      );
      const finalSalary = Number(driver.mainSalary || 0) + ordersSalary;

      // Calculate total deductions
      const totalDeductions =
        Number(driver.talabatDeductionAmount || 0) +
        Number(driver.companyDeductionAmount || 0) +
        Number(driver.pettyCashDeductionAmount || 0);

      return sum + (finalSalary - totalDeductions);
    }, 0);

    // Add employees net salary
    return driversTotal + allEmployeesStats.netSalary;
  }, [driversSalaries, allEmployeesStats.netSalary]);

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
    return driversCashPayment + allEmployeesStats.cashPayment;
  }, [driversSalaries, allEmployeesStats.cashPayment]);

  const sumRow = {
    _id: "sum-row",
    sequenceNumber: t("total"),
    firstName: t("total"),
    name: "",
    vehicle: "",
    mainOrder: calculateColumnSum("mainOrder"),
    additionalOrder: calculateColumnSum("additionalOrder"),
    salaryMainOrders: calculateColumnSum("salaryMainOrders"),
    salaryAdditionalOrders: calculateColumnSum("salaryAdditionalOrders"),
    mainSalary: calculateColumnSum("mainSalary"),
    talabatDeductionAmount: calculateColumnSum("talabatDeductionAmount"),
    companyDeductionAmount: calculateColumnSum("companyDeductionAmount"),
    pettyCashDeductionAmount: calculateColumnSum("pettyCashDeductionAmount"),
    cashAmount: calculateColumnSum("cashAmount"),
    netSalary: calculateColumnSum("netSalary"),
    remarks: "",
    actions: "",
  };

  const rowsWithSum = [...driversSalaries, sumRow];

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Drivers Salary Report",
  });

  useEffect(() => {
    setRows(rowsWithSum);
  }, [driversSalaries]);

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
          {specialBikeDriverStats && (
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
                      {specialBikeDriverStats.mainSalary.toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                    <Typography variant="body1" gutterBottom>
                      {t("deductions")}
                    </Typography>
                    <Typography variant="h6">
                      {specialBikeDriverStats.deductions.toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                    <Typography variant="body1" gutterBottom>
                      {t("netSalaryAfterDeductions")}
                    </Typography>
                    <Typography variant="h6">
                      {specialBikeDriverStats.bankTransfer.toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                    <Typography variant="body1" gutterBottom>
                      {t("cashSalary")}
                    </Typography>
                    <Typography variant="h6">
                      {specialBikeDriverStats.cashPayment.toFixed(3)}
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
                    {allBikeDriversStats.mainSalary.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("deductions")}
                  </Typography>
                  <Typography variant="h6">
                    {allBikeDriversStats.deductions.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("netSalaryAfterDeductions")}
                  </Typography>
                  <Typography variant="h6">
                    {allBikeDriversStats.bankTransfer.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("cashPayment")}
                  </Typography>
                  <Typography variant="h6">
                    {allBikeDriversStats.cashPayment.toFixed(3)}
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
                    {allDriversStats.mainSalary.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("deductions")}
                  </Typography>
                  <Typography variant="h6">
                    {allDriversStats.deductions.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("netSalaryAfterDeductions")}
                  </Typography>
                  <Typography variant="h6">
                    {allDriversStats.bankTransfer.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("cashPayment")}
                  </Typography>
                  <Typography variant="h6">
                    {allDriversStats.cashPayment.toFixed(3)}
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
                    {allEmployeesStats.mainSalary.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("deductions")}
                  </Typography>
                  <Typography variant="h6">
                    {allEmployeesStats.deductions.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("netSalaryAfterDeductions")}
                  </Typography>
                  <Typography variant="h6">
                    {allEmployeesStats.netSalary.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("cashPayment")}
                  </Typography>
                  <Typography variant="h6">
                    {allEmployeesStats.cashPayment.toFixed(3)}
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
                    {allDriversStats.bankTransfer.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("totalDriversCashPayment")}
                  </Typography>
                  <Typography variant="h6">
                    {allDriversStats.cashPayment.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("totalBankTransfer")}
                  </Typography>
                  <Typography variant="h6">
                    {(totalNetSalary - totalCashPayment).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body1" gutterBottom>
                    {t("grandTotal")}
                  </Typography>
                  <Typography variant="h6">
                    {totalNetSalary.toFixed(3)}
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
                    {(totalNetSalary - totalCashPayment).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ textAlign: "center" }}>
                  <Typography
                    color={colors.greenAccent[500]}
                    fontSize={16}
                    fontWeight="bold"
                  >
                    {t("totalCashPaymentAllStaff")} <br />
                    {totalCashPayment.toFixed(3)}
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
          totalDriversNetSalary: allDriversStats.netSalary,
          totalDriversCashPayment: allDriversStats.cashPayment,
          totalBankTransfer: totalNetSalary - totalCashPayment,
          grandTotal: totalNetSalary,
          totalBankTransferAllStaff: totalNetSalary - totalCashPayment,
          totalCashPaymentAllStaff: totalCashPayment,
        }}
      />
    </Box>
  );
};

export default MonthlySalaryDetails;
