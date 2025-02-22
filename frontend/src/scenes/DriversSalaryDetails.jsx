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
import SaveIcon from "@mui/icons-material/Save";
import { useSelector, useDispatch } from "react-redux";
import { overrideDriverSalary, fetchSalaries } from "../redux/driversSlice";
import { pulsar } from "ldrs";
import { useReactToPrint } from "react-to-print";
import PrintableTable from "./PrintableTable";
import styles from "./Print.module.css";
import { useTranslation } from "react-i18next";
import IconButton from "@mui/material/IconButton";

const DriversSalaryDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const driversSalaries = useSelector((state) => state.drivers.salaries);
  const status = useSelector((state) => state.drivers.salariesStatus);
  const error = useSelector((state) => state.drivers.salariesError);
  const componentRef = useRef();
  const [rows, setRows] = useState([]);
  const [gridState, setGridState] = useState({
    rowModifications: {},
    editedRows: {},
  });

  const processRowUpdate = (newRow, oldRow) => {
    if (newRow._id === "sum-row") return oldRow;

    const changes = Object.entries(newRow).reduce((acc, [key, value]) => {
      if (value !== oldRow[key]) acc[key] = value;
      return acc;
    }, {});

    if (Object.keys(changes).length > 0) {
      setGridState((prev) => ({
        ...prev,
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

    return newRow;
  };

  const handleUpdate = async (row) => {
    const modifications = gridState.rowModifications[row._id];
    if (!modifications || Object.keys(modifications).length === 0) return;

    try {
      await dispatch(
        overrideDriverSalary({
          values: { driverId: row._id, ...modifications },
        })
      );

      // Refresh the data
      dispatch(fetchSalaries());

      // Clear the modifications for this row
      setGridState((prev) => ({
        ...prev,
        rowModifications: { ...prev.rowModifications, [row._id]: undefined },
        editedRows: { ...prev.editedRows, [row._id]: undefined },
      }));
    } catch (error) {
      console.error("Error updating row:", error);
    }
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
      field: "finalSalary",
      headerName: t("finalSalary"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: ({
        row: { salaryAdditionalOrders, salaryMainOrders, mainSalary },
      }) => {
        const final = (
          Number(mainSalary || 0) +
          Number(salaryMainOrders || 0) +
          Number(salaryAdditionalOrders || 0)
        ).toFixed(3);
        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {final}
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
      editable: true, // Make it editable
      renderCell: ({
        row: { mainSalary, salaryAdditionalOrders, salaryMainOrders, _id },
      }) => {
        const finalSalary =
          Number(mainSalary || 0) +
          Number(salaryMainOrders || 0) +
          Number(salaryAdditionalOrders || 0);
        const cash = (finalSalary - Number(mainSalary || 0)).toFixed(3);

        // Add edit button if row has been modified
        const isEdited = gridState?.editedRows?.[_id];

        return (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            pr={2}
          >
            <Box flex={1} textAlign="center">
              {cash}
            </Box>
            {isEdited && (
              <IconButton
                size="small"
                onClick={() => handleUpdate(rows)}
                sx={{ color: colors.greenAccent[500] }}
              >
                <SaveIcon />
              </IconButton>
            )}
          </Box>
        );
      },
      valueFormatter: (params) => {
        return params.value ? Number(params.value).toFixed(3) : "0.000";
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

    const finalSalary =
      Number(specialDriver.mainSalary || 0) +
      Number(specialDriver.salaryMainOrders || 0) +
      Number(specialDriver.salaryAdditionalOrders || 0);

    const totalDeductions =
      Number(specialDriver.talabatDeductionAmount || 0) +
      Number(specialDriver.companyDeductionAmount || 0) +
      Number(specialDriver.pettyCashDeductionAmount || 0);

    const netSalary = finalSalary - totalDeductions;
    const cashSalary = finalSalary - Number(specialDriver.mainSalary || 0);

    return {
      mainOrder: Number(specialDriver.mainOrder || 0),
      additionalOrder: Number(specialDriver.additionalOrder || 0),
      mainSalary: Number(specialDriver.mainSalary || 0),
      finalSalary,
      deductions: totalDeductions,
      netSalary,
      cashPayment: cashSalary,
    };
  }, [driversSalaries]);

  const allBikeDriversStats = useMemo(() => {
    const bikeDrivers = driversSalaries.filter(
      (driver) => driver.vehicle === "Bike"
    );

    return {
      mainOrder: bikeDrivers.reduce(
        (sum, driver) => sum + Number(driver.mainOrder || 0),
        0
      ),
      additionalOrder: bikeDrivers.reduce(
        (sum, driver) => sum + Number(driver.additionalOrder || 0),
        0
      ),
      mainSalary: bikeDrivers.reduce(
        (sum, driver) => sum + Number(driver.mainSalary || 0),
        0
      ),
      finalSalary: bikeDrivers.reduce((sum, driver) => {
        const salary =
          Number(driver.mainSalary || 0) +
          Number(driver.salaryMainOrders || 0) +
          Number(driver.salaryAdditionalOrders || 0);
        const totalDeductions =
          Number(driver.talabatDeductionAmount || 0) +
          Number(driver.companyDeductionAmount || 0) +
          Number(driver.pettyCashDeductionAmount || 0);
        return sum + (salary - totalDeductions);
      }, 0),
      deductions: bikeDrivers.reduce(
        (sum, driver) =>
          sum +
          Number(driver.talabatDeductionAmount || 0) +
          Number(driver.companyDeductionAmount || 0) +
          Number(driver.pettyCashDeductionAmount || 0),
        0
      ),
      netSalary: bikeDrivers.reduce((sum, driver) => {
        const finalSalary =
          Number(driver.mainSalary || 0) +
          Number(driver.salaryMainOrders || 0) +
          Number(driver.salaryAdditionalOrders || 0);
        const totalDeductions =
          Number(driver.talabatDeductionAmount || 0) +
          Number(driver.companyDeductionAmount || 0) +
          Number(driver.pettyCashDeductionAmount || 0);
        return sum + (finalSalary - totalDeductions);
      }, 0),
      cashPayment: bikeDrivers.reduce((sum, driver) => {
        const finalSalary =
          sum +
          Number(driver.mainSalary || 0) +
          Number(driver.salaryMainOrders || 0) +
          Number(driver.salaryAdditionalOrders || 0);
        return finalSalary - Number(driver.mainSalary || 0);
      }, 0),
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
      finalSalary: driversSalaries.reduce(
        (sum, driver) =>
          sum +
          Number(driver.mainSalary || 0) +
          Number(driver.salaryMainOrders || 0) +
          Number(driver.salaryAdditionalOrders || 0),
        0
      ),
      deductions: driversSalaries.reduce(
        (sum, driver) =>
          sum +
          Number(driver.talabatDeductionAmount || 0) +
          Number(driver.companyDeductionAmount || 0) +
          Number(driver.pettyCashDeductionAmount || 0),
        0
      ),
      netSalary: driversSalaries.reduce((sum, driver) => {
        const finalSalary =
          Number(driver.mainSalary || 0) +
          Number(driver.salaryMainOrders || 0) +
          Number(driver.salaryAdditionalOrders || 0);
        const totalDeductions =
          Number(driver.talabatDeductionAmount || 0) +
          Number(driver.companyDeductionAmount || 0) +
          Number(driver.pettyCashDeductionAmount || 0);
        return sum + (finalSalary - totalDeductions);
      }, 0),
      cashPayment: driversSalaries.reduce((sum, driver) => {
        const finalSalary =
          Number(driver.mainSalary || 0) +
          Number(driver.salaryMainOrders || 0) +
          Number(driver.salaryAdditionalOrders || 0);
        return finalSalary - Number(driver.mainSalary || 0);
      }, 0),
    };
  }, [driversSalaries]);

  const totalNetSalary = useMemo(() => {
    return driversSalaries.reduce((sum, driver) => {
      const finalSalary =
        Number(driver.mainSalary || 0) +
        Number(driver.salaryMainOrders || 0) +
        Number(driver.salaryAdditionalOrders || 0);

      const totalDeductions =
        Number(driver.talabatDeductionAmount || 0) +
        Number(driver.companyDeductionAmount || 0) +
        Number(driver.pettyCashDeductionAmount || 0);

      return sum + (finalSalary - totalDeductions);
    }, 0);
  }, [driversSalaries]);

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
      <Header
        title={t("driversSalaryDetailsTitle")}
        subtitle={t("driversSalaryDetailsSubtitle")}
      />

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
          editMode="cell"
          processRowUpdate={processRowUpdate}
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
        backgroundColor={colors.primary[400]}
        borderRadius="4px"
      >
        <Typography variant="h5" color={colors.grey[100]} mb="20px">
          {t("summary")}
        </Typography>

        <Grid container spacing={3}>
          {/* Special Bike Driver Summary */}
          {specialBikeDriverStats && (
            <Grid item xs={12}>
              <Box
                backgroundColor={colors.primary[500]}
                p="15px"
                borderRadius="4px"
              >
                <Typography
                  variant="h6"
                  color={colors.greenAccent[500]}
                  mb="10px"
                  fontSize="1.2rem"
                >
                  {t("specialBikeDriverSummary")}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={2} sx={{ textAlign: "center" }}>
                    <Typography>
                      {t("mainSalary")} <br />
                      {specialBikeDriverStats.mainSalary.toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: "center" }}>
                    <Typography>
                      {t("finalSalary")} <br />
                      {specialBikeDriverStats.finalSalary.toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: "center" }}>
                    <Typography>
                      {t("netSalaryAfterDeductions")} <br />
                      {specialBikeDriverStats.netSalary.toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: "center" }}>
                    <Typography>
                      {t("cashSalary")} <br />
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
              backgroundColor={colors.primary[500]}
              p="15px"
              borderRadius="4px"
            >
              <Typography
                variant="h6"
                color={colors.greenAccent[500]}
                mb="10px"
                fontSize="1.2rem"
              >
                {t("allBikeDriversSummary")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("mainSalary")} <br />
                    {allBikeDriversStats.mainSalary.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("deductions")} <br />
                    {allBikeDriversStats.deductions.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("netSalaryAfterDeductions")} <br />
                    {allBikeDriversStats.netSalary.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("cashPayment")} <br />
                    {allBikeDriversStats.cashPayment.toFixed(3)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* All Drivers Summary */}
          <Grid item xs={12}>
            <Box
              backgroundColor={colors.primary[500]}
              p="15px"
              borderRadius="4px"
            >
              <Typography
                variant="h6"
                color={colors.greenAccent[500]}
                mb="10px"
                fontSize="1.2rem"
              >
                {t("allDriversSummary")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("mainSalary")}
                    <br />
                    {allDriversStats.mainSalary.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("deductions")}
                    <br />
                    {allDriversStats.deductions.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("netSalaryAfterDeductions")} <br />
                    {allDriversStats.netSalary.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("cashPayment")}
                    <br />
                    {allDriversStats.cashPayment.toFixed(3)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Final Summary */}
          <Grid item xs={12}>
            <Box
              backgroundColor={colors.primary[500]}
              p="15px"
              borderRadius="4px"
            >
              <Typography
                variant="h6"
                color={colors.greenAccent[500]}
                mb="10px"
                fontSize="1.2rem"
              >
                {t("finalSummary")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={3} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("totalDriversNetSalary")} <br />
                    {totalNetSalary.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("totalDriversCashPayment")} <br />
                    {allDriversStats.cashPayment.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("totalBankTransfer")} <br />
                    {(totalNetSalary - allDriversStats.cashPayment).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("grandTotal")} <br />
                    {totalNetSalary.toFixed(3)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DriversSalaryDetails;
