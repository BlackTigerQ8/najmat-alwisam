import React, { useEffect, useState, useMemo, useRef } from "react";
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
// import UpdateIcon from "@mui/icons-material/Update";
import SaveIcon from "@mui/icons-material/Save";
import { useSelector, useDispatch } from "react-redux";
import { overrideDriverSalary, fetchSalaries } from "../redux/driversSlice";
import { pulsar } from "ldrs";
import { useReactToPrint } from "react-to-print";
import PrintableTable from "./PrintableTable";
import styles from "./Print.module.css";
import { useTranslation } from "react-i18next";

const DriversSalary = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const driversSalaries = useSelector((state) => state.drivers.salaries);
  const status = useSelector((state) => state.drivers.salariesStatus);
  const error = useSelector((state) => state.drivers.salariesError);
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth());
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const componentRef = useRef();
  const [editRowsModel, setEditRowsModel] = useState({});
  const [rowModifications, setRowModifications] = useState({});
  const [editedRows, setEditedRows] = useState({});
  const [rows, setRows] = useState([]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Drivers Salary Report",
  });

  const handleStartMonthChange = (event) => {
    setStartMonth(event.target.value);
  };

  const handleStartYearChange = (event) => {
    setStartYear(event.target.value);
  };

  const handleEndMonthChange = (event) => {
    setEndMonth(event.target.value);
  };

  const handleEndYearChange = (event) => {
    setEndYear(event.target.value);
  };

  const netCarDriversSalary = useMemo(() => {
    const carDrivers = driversSalaries.filter(
      (driver) => driver.vehicle === "Car"
    );

    return carDrivers.reduce((total, driver) => {
      return (
        total +
        Number(driver?.salaryMainOrders) +
        Number(driver?.salaryAdditionalOrders) -
        Number(driver?.talabatDeductionAmount) -
        Number(driver?.companyDeductionAmount) -
        Number(driver?.pettyCashDeductionAmount)
      );
    }, 0);
  }, [driversSalaries]);

  const netBikeDriversSalary = useMemo(() => {
    const carDrivers = driversSalaries.filter(
      (driver) => driver.vehicle === "Bike"
    );

    return carDrivers.reduce((total, driver) => {
      return (
        total +
        Number(driver.salaryMainOrders) +
        Number(driver.salaryAdditionalOrders) -
        Number(driver.talabatDeductionAmount) -
        Number(driver.companyDeductionAmount) -
        Number(driver.pettyCashDeductionAmount)
      );
    }, 0);
  }, [driversSalaries]);

  const totalMonthlySalary = useMemo(() => {
    return driversSalaries.reduce((total, driver) => {
      return (
        total +
        Number(driver.salaryMainOrders) +
        Number(driver.salaryAdditionalOrders)
      );
    }, 0);
  }, [driversSalaries]);

  const totalMonthlyDeduction = useMemo(() => {
    return driversSalaries.reduce((total, driver) => {
      return (
        total +
        Number(driver.talabatDeductionAmount) +
        Number(driver.companyDeductionAmount) +
        Number(driver.pettyCashDeductionAmount)
      );
    }, 0);
  }, [driversSalaries]);

  const totalNetSalary = useMemo(() => {
    return totalMonthlySalary - totalMonthlyDeduction;
  }, [totalMonthlySalary, totalMonthlyDeduction]);

  const processRowUpdate = (newRow, oldRow) => {
    // Don't process updates for sum row
    if (newRow._id === "sum-row") {
      return oldRow;
    }

    const id = newRow._id;
    const changes = {};

    Object.keys(newRow).forEach((field) => {
      if (newRow[field] !== oldRow[field]) {
        changes[field] = newRow[field];
      }
    });

    if (Object.keys(changes).length > 0) {
      // Store changes for save operation
      setRowModifications((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          ...changes,
        },
      }));

      setEditedRows((prev) => ({
        ...prev,
        [id]: true,
      }));
    }

    return newRow;
  };

  // Add this error handler
  const handleProcessRowUpdateError = (error) => {
    console.error(error);
  };

  useEffect(() => {
    setRows(driversSalaries);
  }, [driversSalaries]);

  const handleUpdate = (row) => {
    try {
      const modifications = rowModifications[row._id];

      if (!modifications || Object.keys(modifications).length === 0) {
        return;
      }

      console.log("Sending modifications:", modifications);

      // Only send the modified fields
      const values = {
        driverId: row._id,
      };

      // Add only the modified fields to the values object
      Object.entries(modifications).forEach(([key, value]) => {
        // Include empty string values for remarks
        if (key === "remarks" || value !== undefined) {
          values[key] = value;
        }
      });

      dispatch(
        overrideDriverSalary({
          values,
        })
      ).then(() => {
        // After successful update, refresh the salaries data
        const startDate = new Date(startYear, startMonth, 1);
        const endDate = new Date(startYear, startMonth + 1, 0);

        dispatch(
          fetchSalaries({
            startDate,
            endDate,
          })
        );

        // Clear modifications for this row
        setRowModifications((prev) => {
          const newState = { ...prev };
          delete newState[row._id];
          return newState;
        });

        setEditedRows((prev) => {
          const newState = { ...prev };
          delete newState[row._id];
          return newState;
        });
      });
    } catch (error) {
      console.error("Error updating row:", error);
    }
  };

  const columns = [
    {
      field: "sequenceNumber",
      headerName: t("no."),
      flex: 0.2,
      renderCell: (params) => {
        if (params.row._id === "sum-row") {
          return "";
        }
        const currentIndex = rowsWithSum.findIndex(
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
      flex: 0.75,
      headerAlign: "center",
      align: "center",
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
            {Number(mainOrder) + Number(additionalOrder)}
          </Box>
        );
      },
    },
    {
      field: "salaryMainOrders",
      headerName: t("salaryMainOrders"),
      //editable: true,
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => {
        return Number(params.value).toFixed(3);
      },
    },
    {
      field: "salaryAdditionalOrders",
      headerName: t("salaryAdditionalOrders"),
      //editable: true,
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => {
        return Number(params.value).toFixed(3);
      },
    },
    {
      field: "finalSalary",
      headerName: t("finalSalary"),
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { salaryAdditionalOrders, salaryMainOrders } }) => {
        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {(
              Number(salaryMainOrders) + Number(salaryAdditionalOrders)
            ).toFixed(3)}
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
        return params.value?.toFixed(3);
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
        return params.value?.toFixed(3);
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
        return params.value?.toFixed(3);
      },
    },
    {
      field: "netSalary",
      headerName: t("netSalary"),
      headerAlign: "center",
      align: "center",
      renderCell: ({
        row: {
          salaryAdditionalOrders,
          salaryMainOrders,
          pettyCashDeductionAmount,
          companyDeductionAmount,
          talabatDeductionAmount,
        },
      }) => {
        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {parseFloat(
              Number(salaryMainOrders) +
                Number(salaryAdditionalOrders) -
                Number(pettyCashDeductionAmount) -
                Number(companyDeductionAmount) -
                Number(talabatDeductionAmount)
            ).toFixed(3)}
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
          editedRows[rowId] &&
            Object.keys(rowModifications[rowId] || {}).length > 0
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

  const calculateColumnSum = (fieldName) => {
    const sum = driversSalaries.reduce((total, driver) => {
      return total + Number(driver[fieldName] || 0);
    }, 0);
    return sum;
  };

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

    talabatDeductionAmount: calculateColumnSum("talabatDeductionAmount"),
    companyDeductionAmount: calculateColumnSum("companyDeductionAmount"),
    pettyCashDeductionAmount: calculateColumnSum("pettyCashDeductionAmount"),
    cashAmount: calculateColumnSum("cashAmount"),
    netSalary: calculateColumnSum("netSalary"),
    remarks: "",
    actions: "",
  };

  const rowsWithSum = [...driversSalaries, sumRow];

  useEffect(() => {
    const baseRows = driversSalaries;
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
      talabatDeductionAmount: calculateColumnSum("talabatDeductionAmount"),
      companyDeductionAmount: calculateColumnSum("companyDeductionAmount"),
      pettyCashDeductionAmount: calculateColumnSum("pettyCashDeductionAmount"),
      cashAmount: calculateColumnSum("cashAmount"),
      netSalary: calculateColumnSum("netSalary"),
      remarks: "",
      actions: "",
    };

    setRows([...baseRows, sumRow]);
  }, [driversSalaries, t]);

  useEffect(() => {
    // Get the first and last day of the current month by default
    const startDate = new Date(startYear, startMonth, 1);
    const endDate = new Date(startYear, startMonth + 1, 0); // Last day of the month

    dispatch(
      fetchSalaries({
        startDate,
        endDate,
      })
    );
  }, [dispatch, startMonth, startYear]);

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

  const onSearchSubmit = () => {
    const startDate = new Date(startYear, startMonth, 1);
    const endDate = new Date(endYear, endMonth + 1, 0);

    dispatch(
      fetchSalaries({
        startDate,
        endDate,
      })
    );
  };

  return (
    <Box m="20px">
      <Header
        title={t("driversSalaryTitle")}
        subtitle={t("driversSalarySubtitle")}
      />
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>{t("startMonth")}</InputLabel>
          <Select
            value={startMonth}
            onChange={handleStartMonthChange}
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
          value={startYear}
          onChange={handleStartYearChange}
          sx={{ width: 100, mr: 2 }}
        />
        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>{t("endMonth")}</InputLabel>
          <Select
            value={endMonth}
            onChange={handleEndMonthChange}
            label="End Month"
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
          value={endYear}
          onChange={handleEndYearChange}
          sx={{ width: 100 }}
        />
        <Box display="flex" sx={{ gridColumn: "span 1" }} marginLeft={"20px"}>
          <Button
            onClick={onSearchSubmit}
            color="secondary"
            variant="contained"
          >
            {t("search")}
          </Button>
        </Box>
        <Box display="flex" sx={{ gridColumn: "span 1" }} marginLeft={"20px"}>
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
      </Box>
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
          // checkboxSelection
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          editRowsModel={editRowsModel}
          onEditRowsModelChange={(newModel) => setEditRowsModel(newModel)}
          className={styles.grid}
          editMode="cell"
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          experimentalFeatures={{ newEditingApi: true }}
          getRowClassName={(params) =>
            params.row._id === "sum-row" ? `sum-row-highlight` : ""
          }
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
              borderBottom: `2px solid ${colors.grey[100]}`,
            },
          }}
        />
        <PrintableTable
          rows={rowsWithSum}
          columns={columns}
          ref={componentRef}
          orientation="landscape"
          summary={{
            netCarDriversSalary,
            netBikeDriversSalary,
            totalMonthlySalary,
            totalMonthlyDeduction,
            totalNetSalary,
          }}
        />

        {/* Summary Section */}
        <Box mt="20px" className={styles.notes}>
          <Box
            mt={4}
            p={3}
            bgcolor={colors.primary[400]}
            borderRadius="4px"
            display="grid"
            gap="30px"
            sx={{
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(5, 1fr)",
              },
            }}
          >
            <Box bgcolor={colors.primary[400]} p={2} borderRadius={2}>
              <Typography variant="h6" color={colors.grey[100]} mb={1}>
                {t("carDriversTotalNetSalary")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    color={
                      netCarDriversSalary >= 0
                        ? colors.greenAccent[500]
                        : colors.redAccent[500]
                    }
                    sx={{
                      fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
                    }}
                  >
                    {netCarDriversSalary.toFixed(3)}
                    <span style={{ fontSize: "0.8em" }}> {t("kd")}</span>
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box bgcolor={colors.primary[400]} p={2} borderRadius={2}>
              <Typography variant="h6" color={colors.grey[100]} mb={1}>
                {t("bikeDriversTotalNetSalary")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    color={
                      netBikeDriversSalary >= 0
                        ? colors.greenAccent[500]
                        : colors.redAccent[500]
                    }
                    sx={{
                      fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
                    }}
                  >
                    {netBikeDriversSalary.toFixed(3)}
                    <span style={{ fontSize: "0.8em" }}> {t("kd")}</span>
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box bgcolor={colors.primary[400]} p={2} borderRadius={2}>
              <Typography variant="h6" color={colors.grey[100]} mb={1}>
                {t("totalMonthlySalary")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    color={
                      totalMonthlySalary >= 0
                        ? colors.greenAccent[500]
                        : colors.redAccent[500]
                    }
                    sx={{
                      fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
                    }}
                  >
                    {totalMonthlySalary.toFixed(3)}
                    <span style={{ fontSize: "0.8em" }}> {t("kd")}</span>
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box bgcolor={colors.primary[400]} p={2} borderRadius={2}>
              <Typography variant="h6" color={colors.grey[100]} mb={1}>
                {t("totalMonthlyDeduction")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    color={colors.redAccent[500]}
                    sx={{
                      fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
                    }}
                  >
                    {totalMonthlyDeduction.toFixed(3)}
                    <span style={{ fontSize: "0.8em" }}> {t("kd")}</span>
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box bgcolor={colors.primary[400]} p={2} borderRadius={2}>
              <Typography variant="h6" color={colors.grey[100]} mb={1}>
                {t("totalNetSalary")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    color={
                      totalNetSalary >= 0
                        ? colors.greenAccent[500]
                        : colors.redAccent[500]
                    }
                    sx={{
                      fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
                    }}
                  >
                    {totalNetSalary.toFixed(3)}
                    <span style={{ fontSize: "0.8em" }}> {t("kd")}</span>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DriversSalary;
