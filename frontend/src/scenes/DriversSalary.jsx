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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
import UpdateIcon from "@mui/icons-material/Update";
import { useSelector, useDispatch } from "react-redux";
import { overrideDriverSalary, fetchSalaries } from "../redux/driversSlice";
import { pulsar } from "ldrs";
import { useReactToPrint } from "react-to-print";
import { startOfMonth, endOfMonth } from "date-fns";
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

  const [editRowsModel, setEditRowsModel] = useState({});

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

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "NO.",
      flex: 0.25,
      renderCell: (params) => {
        if (params.row._id === "sum-row") {
          return "";
        }
        // Get the current row's position in the grid
        const currentIndex = rowsWithSum.findIndex(
          (row) => row._id === params.row._id
        );
        return currentIndex + 1;
      },
      // Disable sorting for sequence column
      sortable: false,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 0.5,
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
      field: "mainOrder", // NEW
      headerName: t("mainOrders"),
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "additionalOrder", // NEW
      headerName: t("additionalOrders"),
      type: Number,
      editable: true,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "totalOrders", // NEW (main  + additional)
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
      field: "salaryMainOrders", // NEW
      headerName: t("salaryMainOrders"),
      //editable: true,
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "salaryAdditionalOrders", // NEW
      headerName: t("salaryAdditionalOrders"),
      //editable: true,
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "finalSalary", // NEW
      headerName: t("finalSalary"),
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { salaryAdditionalOrders, salaryMainOrders } }) => {
        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {Number(salaryMainOrders) + Number(salaryAdditionalOrders)}
          </Box>
        );
      },
    },
    {
      field: "talabatDeductionAmount",
      headerName: t("talabatDeductionAmount"),
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "companyDeductionAmount",
      headerName: t("companyDeductionAmount"),
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "pettyCashDeductionAmount",
      headerName: t("pettyCashDeductionAmount"),
      headerAlign: "center",
      align: "center",
      //editable: true,
    },
    {
      field: "netSalary", // NEW
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
            ).toFixed(1)}
          </Box>
        );
      },
    },
    {
      field: "remarks", // NEW
      headerName: t("remarks"),
      headerAlign: "center",
      align: "center",
    },
    {
      field: "actions",
      headerName: t("actions"),
      width: 150,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const isSumRow = params.row._id === "sum-row";
        return (
          <Box display="flex" justifyContent="center">
            {isSumRow ? null : (
              <Button
                variant="contained"
                color="primary"
                size="small"
                style={{ marginRight: 8 }}
                onClick={() => handleUpdate(params.row)}
                startIcon={<UpdateIcon />}
              ></Button>
            )}
          </Box>
        );
      },
    },
  ];

  const calculateColumnSum = (fieldName) => {
    return driversSalaries.reduce((total, driver) => {
      return total + (driver[fieldName] || 0);
    }, 0);
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
    //if (status === "succeeded") {
    dispatch(fetchSalaries());
    //}
  }, [dispatch]);

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

  const handleUpdate = (row) => {
    try {
      const {
        mainOrder,
        additionalOrder,
        talabatDeductionAmount,
        companyDeductionAmount,
      } = row;
      dispatch(
        overrideDriverSalary({
          values: {
            driverId: row._id,
            mainOrder,
            additionalOrder,
            talabatDeductionAmount,
            companyDeductionAmount,
          },
        })
      );
    } catch (error) {
      console.error("Row does not have a valid _id field:", row);
    }
  };

  const onSearchSubmit = async () => [
    dispatch(
      fetchSalaries({
        startDate: startOfMonth(new Date(startYear, startMonth)),
        endDate: endOfMonth(new Date(endYear, endMonth)),
      })
    ),
  ];

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
          <Button onClick={handlePrint} color="primary" variant="contained">
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
          rows={rowsWithSum}
          columns={columns}
          getRowId={(row) => row._id}
          editRowsModel={editRowsModel}
          onEditRowsModelChange={(newModel) => setEditRowsModel(newModel)}
          className={styles.grid}
          getRowClassName={(params) =>
            params.row._id === "sum-row" ? `sum-row-highlight` : ""
          }
          sx={{
            "& .sum-row-highlight": {
              bgcolor: colors.blueAccent[700],
              "&:hover": {
                bgcolor: colors.blueAccent[600],
              },
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
              "& > div": {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "20px",
                borderRadius: "8px",
              },
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                color={colors.grey[100]}
                mb={1}
                sx={{
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  fontWeight: "bold",
                }}
              >
                {t("carDriversTotalNetSalary")}
              </Typography>
              <Typography
                variant="h4"
                color="secondary"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                }}
              >
                <span>{netCarDriversSalary}</span>
                <span style={{ fontSize: "1em" }}> {t("kd")}</span>
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                color={colors.grey[100]}
                mb={1}
                sx={{
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  fontWeight: "bold",
                }}
              >
                {t("bikeDriversTotalNetSalary")}
              </Typography>
              <Typography
                variant="h4"
                color="secondary"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                }}
              >
                <span>{netBikeDriversSalary}</span>
                <span style={{ fontSize: "1em" }}> {t("kd")}</span>
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                color={colors.grey[100]}
                mb={1}
                sx={{
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  fontWeight: "bold",
                }}
              >
                {t("totalMonthlySalary")}
              </Typography>
              <Typography
                variant="h4"
                color="secondary"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                }}
              >
                <span>{totalMonthlySalary}</span>
                <span style={{ fontSize: "1em" }}> {t("kd")}</span>
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                color={colors.grey[100]}
                mb={1}
                sx={{
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  fontWeight: "bold",
                }}
              >
                {t("totalMonthlyDeduction")}
              </Typography>
              <Typography
                variant="h4"
                color="secondary"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                }}
              >
                <span>{totalMonthlyDeduction}</span>
                <span style={{ fontSize: "1em" }}> {t("kd")}</span>
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                color={colors.grey[100]}
                mb={1}
                sx={{
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  fontWeight: "bold",
                }}
              >
                {t("totalNetSalary")}
              </Typography>
              <Typography
                variant="h4"
                color="secondary"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                }}
              >
                <span>{totalNetSalary}</span>
                <span style={{ fontSize: "1em" }}> {t("kd")}</span>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DriversSalary;
