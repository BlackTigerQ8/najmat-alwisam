import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import { DataGrid } from "@mui/x-data-grid";
import { pulsar } from "ldrs";
import {
  Box,
  Button,
  Typography,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Backdrop,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

import { tokens } from "../theme";
import Header from "../components/Header";
import PrintableTable from "./PrintableTable";
import styles from "./Print.module.css";
import { overrideDriverSalary, fetchSalaries } from "../redux/driversSlice";
import { fetchSalaryConfigs } from "../redux/salaryConfigSlice";
import {
  fetchCurrentMonthPettyCash,
  fetchPettyCash,
  searchPettyCash,
} from "../redux/pettyCashSlice";

const initialGridState = {
  editRowsModel: {},
  rowModifications: {},
  editedRows: {},
  rows: [],
};

const initialDateRange = {
  startMonth: new Date().getMonth(),
  startYear: new Date().getFullYear(),
};

const calculateColumnSum = (rows, fieldName) => {
  return rows
    .filter((row) => row._id !== "sum-row")
    .reduce((total, row) => total + Number(row[fieldName] || 0), 0);
};

const DriversSalary = () => {
  // Theme and Translations
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const componentRef = useRef();

  // State Management
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [gridState, setGridState] = useState(initialGridState);
  const [isLoading, setIsLoading] = useState(false);

  // Redux Selectors
  const { pettyCash } = useSelector((state) => state.pettyCash);
  const driversSalaries = useSelector((state) => state.drivers.salaries);
  const status = useSelector((state) => state.drivers.salariesStatus);
  const error = useSelector((state) => state.drivers.salariesError);
  const configs = useSelector((state) => state.salaryConfig.configs);
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");
  const specialDriverId =
    process.env.REACT_APP_SPECIAL_CAR_DRIVER_ID || "6769923ba62e5d54cb6ea18c";

  // Salary Calculation Utilities
  const calculateSalary = useMemo(
    () => ({
      forOrders: (orderCount, vehicleType, mainOrderCount, driverId = null) => {
        // Special case for specific driver
        if (driverId === specialDriverId && vehicleType === "Car") {
          const config = configs.find((c) => c.vehicleType === vehicleType);
          if (!config?.rules) return 26;

          const rule = config.rules.find(
            (r) =>
              orderCount >= r.minOrders &&
              orderCount <=
                (r.maxOrders === Infinity
                  ? Number.MAX_SAFE_INTEGER
                  : r.maxOrders)
          );

          if (!rule) return 26;

          if (rule.fixedAmount > 0) {
            return rule.fixedAmount + 26;
          }

          return (
            (rule.applyToMainOrdersOnly
              ? mainOrderCount * rule.multiplier
              : orderCount * rule.multiplier) + 26
          );
        }

        // Regular case for other drivers
        const config = configs.find((c) => c.vehicleType === vehicleType);
        if (!config?.rules) return 0;

        const rule = config.rules.find(
          (r) =>
            orderCount >= r.minOrders &&
            orderCount <=
              (r.maxOrders === Infinity ? Number.MAX_SAFE_INTEGER : r.maxOrders)
        );

        if (!rule) return 0;

        if (rule.fixedAmount > 0) return rule.fixedAmount;

        return rule.applyToMainOrdersOnly
          ? mainOrderCount * rule.multiplier
          : orderCount * rule.multiplier;
      },

      total: (driver) => {
        if (driver._id === "sum-row") return 0;

        const totalOrders =
          Number(driver.mainOrder || 0) + Number(driver.additionalOrder || 0);
        const mainOrders = Number(driver.mainOrder || 0);
        const ordersSalary = calculateSalary.forOrders(
          totalOrders,
          driver.vehicle,
          mainOrders
        );

        return Number(driver.mainSalary || 0) + ordersSalary;
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
    }),
    [configs]
  );

  // Summary Calculations
  // Summary Calculations
  const summaryCalculations = useMemo(() => {
    // Only use rows that are currently displayed in the grid (active drivers)
    const carDrivers = gridState.rows.filter(
      (driver) => driver.vehicle === "Car" && driver._id !== "sum-row"
    );
    const bikeDrivers = gridState.rows.filter(
      (driver) => driver.vehicle === "Bike" && driver._id !== "sum-row"
    );

    const calculateDriversData = (drivers) => ({
      finalSalary: drivers.reduce((total, driver) => {
        const totalOrders =
          Number(driver.mainOrder || 0) + Number(driver.additionalOrder || 0);
        const mainOrders = Number(driver.mainOrder || 0);
        const ordersSalary = calculateSalary.forOrders(
          totalOrders,
          driver.vehicle,
          mainOrders,
          driver._id
        );
        return total + ordersSalary;
      }, 0),
      totalDeductions: drivers.reduce(
        (total, driver) => total + calculateSalary.deductions(driver),
        0
      ),
    });

    const carDriversData = calculateDriversData(carDrivers);
    const bikeDriversData = calculateDriversData(bikeDrivers);

    return {
      carDrivers: {
        finalSalary: carDriversData.finalSalary,
        totalDeductions: carDriversData.totalDeductions,
        netSalary: carDriversData.finalSalary - carDriversData.totalDeductions,
      },
      bikeDrivers: {
        finalSalary: bikeDriversData.finalSalary,
        totalDeductions: bikeDriversData.totalDeductions,
        netSalary:
          bikeDriversData.finalSalary - bikeDriversData.totalDeductions,
      },
      total: {
        finalSalary: carDriversData.finalSalary + bikeDriversData.finalSalary,
        totalDeductions:
          carDriversData.totalDeductions + bikeDriversData.totalDeductions,
        netSalary:
          carDriversData.finalSalary +
          bikeDriversData.finalSalary -
          (carDriversData.totalDeductions + bikeDriversData.totalDeductions),
      },
    };
  }, [gridState.rows, calculateSalary]);

  // Event Handlers
  const handleDateChange = (field) => (event) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Drivers Salary Report",
  });

  const handleSearch = () => {
    setIsLoading(true);
    const startDate = new Date(dateRange.startYear, dateRange.startMonth, 1);
    const endDate = new Date(dateRange.startYear, dateRange.startMonth + 1, 0);
    dispatch(fetchSalaries({ startDate, endDate }));
    setIsLoading(false);
  };

  const handleUpdate = async (row) => {
    const modifications = gridState.rowModifications[row._id];
    if (!modifications || Object.keys(modifications).length === 0) return;

    try {
      const updatedModifications = {
        ...modifications,
        talabatDeductionAmount: Number(
          modifications.talabatDeductionAmount || 0
        ),
        companyDeductionAmount: Number(
          modifications.companyDeductionAmount || 0
        ),
      };

      await dispatch(
        overrideDriverSalary({
          values: { driverId: row._id, ...updatedModifications },
        })
      );

      const startDate = new Date(dateRange.startYear, dateRange.startMonth, 1);
      const endDate = new Date(
        dateRange.startYear,
        dateRange.startMonth + 1,
        0
      );
      await dispatch(fetchSalaries({ startDate, endDate }));

      setGridState((prev) => ({
        ...prev,
        rowModifications: { ...prev.rowModifications, [row._id]: undefined },
        editedRows: { ...prev.editedRows, [row._id]: undefined },
      }));
    } catch (error) {
      console.error("Error updating row:", error);
    }
  };

  // Grid Configuration
  const processRowUpdate = (newRow, oldRow) => {
    if (newRow._id === "sum-row") return oldRow;

    const changes = Object.entries(newRow).reduce((acc, [key, value]) => {
      // Convert string values to numbers for deduction fields
      if (
        key === "talabatDeductionAmount" ||
        key === "companyDeductionAmount"
      ) {
        const newValue = Number(value || 0);
        const oldValue = Number(oldRow[key] || 0);
        if (newValue !== oldValue) {
          acc[key] = newValue;
        }
      } else if (value !== oldRow[key]) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (Object.keys(changes).length > 0) {
      // Update the gridState with the new values
      setGridState((prev) => ({
        ...prev,
        rows: prev.rows.map((row) =>
          row._id === newRow._id ? { ...row, ...changes } : row
        ),
        rowModifications: {
          ...prev.rowModifications,
          [newRow._id]: {
            ...(prev.rowModifications[newRow._id] || {}),
            ...changes,
          },
        },
        editedRows: { ...prev.editedRows, [newRow._id]: true },
      }));
    }

    return { ...oldRow, ...changes };
  };

  // Effects
  useEffect(() => {
    dispatch(fetchSalaryConfigs());
    dispatch(fetchPettyCash());
  }, [dispatch]);

  useEffect(() => {
    setIsLoading(true);
    const startDate = new Date(dateRange.startYear, dateRange.startMonth, 1);
    const endDate = new Date(dateRange.startYear, dateRange.startMonth + 1, 0);
    dispatch(fetchSalaries({ startDate, endDate }));
    setIsLoading(false);
  }, [dispatch, dateRange.startMonth, dateRange.startYear]);

  useEffect(() => {
    // Update rows with petty cash deductions
    const rowsWithPettyCash = driversSalaries.map((driver) => {
      // Get start and end date for the selected month
      const startDate = new Date(dateRange.startYear, dateRange.startMonth, 1);
      const endDate = new Date(
        dateRange.startYear,
        dateRange.startMonth + 1,
        0
      );

      // Filter petty cash entries by driver ID and spend date
      const driverPettyCashEntries = pettyCash.filter(
        (entry) =>
          entry.deductedFromDriver === driver._id &&
          new Date(entry.spendsDate) >= startDate &&
          new Date(entry.spendsDate) <= endDate
      );

      // Calculate total deductions
      const totalPettyCashDeduction = driverPettyCashEntries.reduce(
        (sum, entry) => sum + Number(entry.cashAmount || 0),
        0
      );

      // console.log(
      //   `Driver ${
      //     driver.firstName
      //   } petty cash for ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}:`,
      //   {
      //     driverId: driver._id,
      //     entries: driverPettyCashEntries,
      //     total: totalPettyCashDeduction,
      //   }
      // );

      return {
        ...driver,
        pettyCashDeductionAmount: totalPettyCashDeduction,
      };
    });

    setGridState((prev) => ({ ...prev, rows: rowsWithPettyCash }));
  }, [driversSalaries, pettyCash, dateRange.startMonth, dateRange.startYear]);

  // Loading and Error States
  if (status === "loading") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <l-pulsar size="70" speed="1.75" color={colors.greenAccent[500]} />
      </Box>
    );
  }

  if (status === "failed") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h5">Error: {error}</Typography>
      </Box>
    );
  }

  const getColumns = ({
    t,
    colors,
    handleUpdate,
    calculateSalary,
    gridState,
  }) => [
    {
      field: "sequenceNumber",
      headerName: t("no"),
      flex: 0.2,
      renderCell: (params) => {
        if (params.row._id === "sum-row") {
          return "";
        }
        const currentIndex = gridState.rows.findIndex(
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
      cellClassName: "name-column--cell",
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
        return t(params.value);
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
      field: "mainOrder",
      headerName: t("mainOrders"),
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "additionalOrder",
      headerName: t("additionalOrders"),
      type: Number,
      editable: true,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "totalOrders", // (main  + additional)
      headerName: t("totalOrders"),
      type: Number,
      flex: 0.75,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { additionalOrder, mainOrder } }) => {
        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {Number(mainOrder || 0) + Number(additionalOrder || 0)}
          </Box>
        );
      },
    },
    {
      field: "salaryMainOrders",
      headerName: t("salaryMainOrders"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { mainOrder, additionalOrder, vehicle, _id } }) => {
        // Skip calculation for sum row
        if (_id === "sum-row") {
          return (
            <Box display="flex" justifyContent="center" borderRadius="4px">
              {calculateColumnSum(gridState.rows, "salaryMainOrders").toFixed(
                3
              )}
            </Box>
          );
        }

        const totalOrders =
          Number(mainOrder || 0) + Number(additionalOrder || 0);

        // Special case for specific bike driver
        if (_id === "6772c32da62e5d54cb6ea8dc") {
          if (totalOrders >= 350 && totalOrders <= 500) {
            return (
              <Box display="flex" justifyContent="center" borderRadius="4px">
                {(totalOrders * 0.5).toFixed(3)}
              </Box>
            );
          } else if (totalOrders > 500) {
            return (
              <Box display="flex" justifyContent="center" borderRadius="4px">
                {(totalOrders * 0.55).toFixed(3)}
              </Box>
            );
          } else {
            return (
              <Box display="flex" justifyContent="center" borderRadius="4px">
                {"0.000"}
              </Box>
            );
          }
        }

        // Regular case for other drivers
        const config = configs.find((c) => c.vehicleType === vehicle);
        if (!config?.rules) return "0.000";

        const rule = config.rules.find(
          (r) =>
            totalOrders >= r.minOrders &&
            totalOrders <=
              (r.maxOrders === Infinity ? Number.MAX_SAFE_INTEGER : r.maxOrders)
        );

        if (!rule) return "0.000";

        if (rule.fixedAmount > 0) {
          return (
            <Box display="flex" justifyContent="center" borderRadius="4px">
              {rule.fixedAmount.toFixed(3)}
            </Box>
          );
        }

        // Calculate salary based on the rule
        let ordersSalary;
        if (rule.applyToMainOrdersOnly) {
          // For rules with applyToMainOrdersOnly, use only mainOrders
          ordersSalary = (Number(mainOrder || 0) * rule.multiplier).toFixed(3);
        } else {
          // For all other rules, use totalOrders
          ordersSalary = (totalOrders * rule.multiplier).toFixed(3);
        }

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {ordersSalary}
          </Box>
        );
      },
    },
    // {
    //   field: "salaryAdditionalOrders",
    //   headerName: t("salaryAdditionalOrders"),
    //   flex: 1,
    //   headerAlign: "center",
    //   align: "center",
    //   valueFormatter: (params) => {
    //     return params.value ? Number(params.value).toFixed(3) : "0.000";
    //   },
    // },
    {
      field: "finalSalary",
      headerName: t("finalSalary"),
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        // For sum row, calculate total from all rows
        if (row._id === "sum-row") {
          const total = gridState.rows
            .filter((driver) => driver._id !== "sum-row")
            .reduce((sum, driver) => {
              const totalOrders =
                Number(driver.mainOrder || 0) +
                Number(driver.additionalOrder || 0);
              const mainOrders = Number(driver.mainOrder || 0);
              const ordersSalary = calculateSalary.forOrders(
                totalOrders,
                driver.vehicle,
                mainOrders,
                driver._id
              );
              return sum + ordersSalary;
            }, 0);
          return (
            <Box display="flex" justifyContent="center" borderRadius="4px">
              {total.toFixed(3)}
            </Box>
          );
        }

        // For regular rows, calculate using the salary calculation utility
        const totalOrders =
          Number(row.mainOrder || 0) + Number(row.additionalOrder || 0);
        const mainOrders = Number(row.mainOrder || 0);
        const ordersSalary = calculateSalary.forOrders(
          totalOrders,
          row.vehicle,
          mainOrders,
          row._id
        );
        const finalSalary = ordersSalary.toFixed(3);

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {finalSalary}
          </Box>
        );
      },
    },
    {
      field: "talabatDeductionAmount",
      headerName: t("talabatDeduction"),
      flex: 1,
      editable: true,
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => {
        return params.value ? Number(params.value).toFixed(3) : "0.000";
      },
    },
    {
      field: "companyDeductionAmount",
      headerName: t("companyDeduction"),
      flex: 1,
      editable: true,
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => {
        return params.value ? Number(params.value).toFixed(3) : "0.000";
      },
    },
    {
      field: "pettyCashDeductionAmount",
      headerName: t("pettyCashDeduction"),
      flex: 1,
      editable: false,
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => {
        return params.value ? Number(params.value).toFixed(3) : "0.000";
      },
    },
    {
      field: "netSalary",
      headerName: t("netSalary"),
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        // For sum row, return the total net salary
        if (row._id === "sum-row") {
          const total = gridState.rows
            .filter((driver) => driver._id !== "sum-row")
            .reduce((sum, driver) => sum + calculateSalary.net(driver), 0);
          return (
            <Box display="flex" justifyContent="center" borderRadius="4px">
              {total.toFixed(3)}
            </Box>
          );
        }

        // For regular rows, calculate net salary using the utility function
        const netSalary = calculateSalary.net(row);

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {netSalary.toFixed(3)}
          </Box>
        );
      },
    },
    {
      field: "remarks",
      headerName: t("remarks"),
      headerAlign: "center",
      align: "center",
      editable: true,
      width: 200,
      renderCell: (params) => {
        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {params.value || ""}
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: t("actions"),
      width: 100,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const isSumRow = params.row._id === "sum-row";
        const rowId = params.row._id;
        const hasChanges = Boolean(
          gridState.editedRows[rowId] &&
            Object.keys(gridState.rowModifications[rowId] || {}).length > 0
        );
        return (
          <Box display="flex" gap={1}>
            {!isSumRow && (
              <Button
                color="secondary"
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={() => handleUpdate(params.row)}
                disabled={!hasChanges}
              >
                {t("save")}
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  const sumRow = {
    _id: "sum-row",
    sequenceNumber: "",
    firstName: t("total"),
    lastName: "",
    vehicle: "",
    mainSalary: calculateColumnSum(gridState.rows, "mainSalary"),
    mainOrder: calculateColumnSum(gridState.rows, "mainOrder"),
    additionalOrder: calculateColumnSum(gridState.rows, "additionalOrder"),
    salaryMainOrders: calculateColumnSum(gridState.rows, "salaryMainOrders"),
    salaryAdditionalOrders: calculateColumnSum(
      gridState.rows,
      "salaryAdditionalOrders"
    ),
    finalSalary: gridState.rows
      .filter((row) => row._id !== "sum-row")
      .reduce((sum, row) => {
        const totalOrders =
          Number(row.mainOrder || 0) + Number(row.additionalOrder || 0);
        const mainOrders = Number(row.mainOrder || 0);
        return (
          sum + calculateSalary.forOrders(totalOrders, row.vehicle, mainOrders)
        );
      }, 0),
    talabatDeductionAmount: calculateColumnSum(
      gridState.rows,
      "talabatDeductionAmount"
    ),
    companyDeductionAmount: calculateColumnSum(
      gridState.rows,
      "companyDeductionAmount"
    ),
    pettyCashDeductionAmount: calculateColumnSum(
      gridState.rows,
      "pettyCashDeductionAmount"
    ),
    netSalary: calculateColumnSum(gridState.rows, "netSalary"),
  };

  const rowsWithSum = [...gridState.rows, sumRow];

  const renderSummarySection = () => {
    return (
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
        gap={2}
        mb={3}
        mt={3}
      >
        {/* Car Drivers Summary */}
        <Box bgcolor={colors.primary[400]} p={2} borderRadius={2}>
          <Typography variant="h6" color={colors.grey[100]} mb={1}>
            {t("carDrivers")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography color={colors.greenAccent[500]}>
                {t("finalSalary")}
              </Typography>
              <Typography color={colors.grey[100]}>
                {summaryCalculations.carDrivers.finalSalary.toFixed(3)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color={colors.greenAccent[500]}>
                {t("totalDeductions")}
              </Typography>
              <Typography color={colors.grey[100]}>
                {summaryCalculations.carDrivers.totalDeductions.toFixed(3)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color={colors.greenAccent[500]}>
                {t("netSalary")}
              </Typography>
              <Typography color={colors.grey[100]}>
                {summaryCalculations.carDrivers.netSalary.toFixed(3)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Bike Drivers Summary */}
        <Box bgcolor={colors.primary[400]} p={2} borderRadius={2}>
          <Typography variant="h6" color={colors.grey[100]} mb={1}>
            {t("bikeDrivers")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography color={colors.greenAccent[500]}>
                {t("finalSalary")}
              </Typography>
              <Typography color={colors.grey[100]}>
                {summaryCalculations.bikeDrivers.finalSalary.toFixed(3)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color={colors.greenAccent[500]}>
                {t("totalDeductions")}
              </Typography>
              <Typography color={colors.grey[100]}>
                {summaryCalculations.bikeDrivers.totalDeductions.toFixed(3)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color={colors.greenAccent[500]}>
                {t("netSalary")}
              </Typography>
              <Typography color={colors.grey[100]}>
                {summaryCalculations.bikeDrivers.netSalary.toFixed(3)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Total Summary */}
        <Box bgcolor={colors.primary[400]} p={2} borderRadius={2}>
          <Typography variant="h6" color={colors.grey[100]} mb={1}>
            {t("totalSummary")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography color={colors.greenAccent[500]}>
                {t("finalSalary")}
              </Typography>
              <Typography color={colors.grey[100]}>
                {summaryCalculations.total.finalSalary.toFixed(3)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color={colors.greenAccent[500]}>
                {t("totalDeductions")}
              </Typography>
              <Typography color={colors.grey[100]}>
                {summaryCalculations.total.totalDeductions.toFixed(3)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color={colors.greenAccent[500]}>
                {t("netSalary")}
              </Typography>
              <Typography
                color={
                  summaryCalculations.total.netSalary >= 0
                    ? colors.greenAccent[500]
                    : colors.redAccent[500]
                }
              >
                {summaryCalculations.total.netSalary.toFixed(3)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

  // Render
  return (
    <Box m="20px">
      <Backdrop
        sx={{
          color: colors.greenAccent[500],
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isLoading}
      >
        <l-pulsar size="70" speed="1.75" color="currentColor" />
      </Backdrop>
      <Header
        title={t("driversSalaryTitle")}
        subtitle={t("driversSalarySubtitle")}
      />

      {/* Controls Section */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>{t("startMonth")}</InputLabel>
          <Select
            value={dateRange.startMonth}
            onChange={handleDateChange("startMonth")}
            label="Start Month"
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
          sx={{ width: 100, mr: 2 }}
        />

        <Button
          onClick={handleSearch}
          color="secondary"
          variant="contained"
          sx={{ mr: 2 }}
        >
          {t("search")}
        </Button>

        <Button
          variant="contained"
          onClick={handlePrint}
          sx={{
            backgroundColor: colors.blueAccent[600],
            "&:hover": { backgroundColor: colors.blueAccent[500] },
          }}
        >
          {t("print")}
        </Button>
      </Box>

      {/* Data Grid */}
      <Box
        mt="40px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": {
            borderBottom: `1px solid ${colors.grey[400]}`,
          },
          "& .name-column--cell": { color: colors.greenAccent[300] },
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
          "& .sum-row-highlight": {
            bgcolor: colors.greenAccent[700],
            fontWeight: "bold",
            fontSize: "1rem",
            "&:hover": { bgcolor: colors.greenAccent[600] },
            "& .MuiDataGrid-cell": { color: colors.grey[100] },
            borderBottom: `2px solid ${colors.grey[100]}`,
          },
        }}
      >
        <DataGrid
          rows={rowsWithSum}
          columns={getColumns({
            t,
            colors,
            handleUpdate,
            calculateSalary,
            gridState,
          })}
          getRowId={(row) => row._id}
          editMode="cell"
          processRowUpdate={processRowUpdate}
          experimentalFeatures={{ newEditingApi: true }}
          getRowClassName={(params) =>
            params.row._id === "sum-row" ? "sum-row-highlight" : ""
          }
          className={styles.grid}
        />
      </Box>

      {/* Summary Section */}
      {renderSummarySection()}

      {/* Printable Table */}
      <PrintableTable
        rows={gridState.rows}
        columns={getColumns({
          t,
          colors,
          handleUpdate,
          calculateSalary,
          gridState,
        })}
        ref={componentRef}
        orientation="landscape"
        summary={{
          netCarDriversSalary: summaryCalculations.carDrivers.netSalary,
          netBikeDriversSalary: summaryCalculations.bikeDrivers.netSalary,
          totalMonthlySalary: summaryCalculations.total.finalSalary,
          totalMonthlyDeduction: summaryCalculations.total.totalDeductions,
          totalNetSalary: summaryCalculations.total.netSalary,
        }}
      />
    </Box>
  );
};

export default DriversSalary;
