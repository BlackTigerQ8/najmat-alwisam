import React, { useEffect, useState, useMemo, useRef } from "react";
import { Box, Typography, useTheme, Grid, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
import { useSelector, useDispatch } from "react-redux";
import { fetchSalaries } from "../redux/driversSlice";
import { fetchSalaries as fetchEmployeesSalaries } from "../redux/usersSlice";
import { pulsar } from "ldrs";
import { useReactToPrint } from "react-to-print";
import PrintableTable from "./PrintableTable";
import styles from "./Print.module.css";
import { useTranslation } from "react-i18next";

const MonthlySalaryDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { t } = useTranslation();
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

  useEffect(() => {
    const currentDate = new Date();
    dispatch(
      fetchSalaries({
        startDate: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        ),
        endDate: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ),
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchEmployeesSalaries());
  }, [dispatch]);

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
      renderCell: ({
        row: { mainSalary, salaryAdditionalOrders, salaryMainOrders, _id },
      }) => {
        const finalSalary =
          Number(mainSalary || 0) +
          Number(salaryMainOrders || 0) +
          Number(salaryAdditionalOrders || 0);
        const cash = (finalSalary - Number(mainSalary || 0)).toFixed(3);

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

  const allEmployeesStats = useMemo(() => {
    const employees = employeesSalaries.filter(
      (employee) => employee.role !== "Admin"
    );

    return {
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

    return driversTotal + allEmployeesStats.netSalary;
  }, [driversSalaries, allEmployeesStats.netSalary]);

  const totalCashPayment = useMemo(() => {
    return allDriversStats.cashPayment + allEmployeesStats.cashPayment;
  }, [allDriversStats.cashPayment, allEmployeesStats.cashPayment]);

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
        <Typography variant="h5" color={colors.grey[100]} mb="20px">
          {t("summary")}
        </Typography>

        <Grid container spacing={3}>
          {/* Special Bike Driver Summary */}
          {specialBikeDriverStats && (
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
              backgroundColor={colors.primary[400]}
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
              backgroundColor={colors.primary[400]}
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

          {/* All Employees Summary */}
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
              >
                {t("allEmployeesSummary")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("deductions")}
                    <br />
                    {allEmployeesStats.deductions.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("netSalaryAfterDeductions")} <br />
                    {allEmployeesStats.netSalary.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("cashPayment")}
                    <br />
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
              >
                {t("finalSummary")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={3} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("totalDriversNetSalary")} <br />
                    {allDriversStats.netSalary.toFixed(3)}
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
                    {(totalNetSalary - totalCashPayment).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: "center" }}>
                  <Typography>
                    {t("grandTotal")} <br />
                    {totalNetSalary.toFixed(3)}
                  </Typography>
                </Grid>
                {/* Add new row for combined totals */}
                <Grid item xs={6} sx={{ textAlign: "center" }}>
                  <Typography
                    color={colors.greenAccent[500]}
                    fontSize={16}
                    fontWeight="bold"
                  >
                    {t("totalBankTransferAllStaff")} <br />
                    {(totalNetSalary - totalCashPayment).toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: "center" }}>
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
