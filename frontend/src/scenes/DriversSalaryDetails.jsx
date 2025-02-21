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

  const columns = [
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
        row: {
          mainSalary,
          salaryAdditionalOrders,
          salaryMainOrders,
          talabatDeductionAmount,
          companyDeductionAmount,
          pettyCashDeductionAmount,
        },
      }) => {
        const finalSalary =
          Number(mainSalary || 0) +
          Number(salaryMainOrders || 0) +
          Number(salaryAdditionalOrders || 0);
        const totalDeductions =
          Number(talabatDeductionAmount || 0) +
          Number(companyDeductionAmount || 0) +
          Number(pettyCashDeductionAmount || 0);
        const cash = (
          finalSalary -
          Number(mainSalary || 0) -
          totalDeductions
        ).toFixed(3);
        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {cash}
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

  const netCarDriversSalary = useMemo(() => {
    const carDrivers = driversSalaries.filter(
      (driver) => driver.vehicle === "Car"
    );

    return carDrivers.reduce((total, driver) => {
      return (
        total +
        Number(driver?.mainSalary) +
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
        Number(driver?.mainSalary) +
        Number(driver?.salaryMainOrders) +
        Number(driver?.salaryAdditionalOrders) -
        Number(driver?.talabatDeductionAmount) -
        Number(driver?.companyDeductionAmount) -
        Number(driver?.pettyCashDeductionAmount)
      );
    }, 0);
  }, [driversSalaries]);

  const totalMonthlySalary = useMemo(() => {
    return driversSalaries.reduce((total, driver) => {
      return (
        total +
        Number(driver?.mainSalary) +
        Number(driver?.salaryMainOrders) +
        Number(driver?.salaryAdditionalOrders)
      );
    }, 0);
  }, [driversSalaries]);

  const totalMonthlyDeduction = useMemo(() => {
    return driversSalaries.reduce((total, driver) => {
      return (
        total +
        Number(driver?.talabatDeductionAmount) +
        Number(driver?.companyDeductionAmount) +
        Number(driver?.pettyCashDeductionAmount)
      );
    }, 0);
  }, [driversSalaries]);

  const totalNetSalary = useMemo(() => {
    return totalMonthlySalary - totalMonthlyDeduction;
  }, [totalMonthlySalary, totalMonthlyDeduction]);

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
      </Box>
    </Box>
  );
};

export default DriversSalaryDetails;
