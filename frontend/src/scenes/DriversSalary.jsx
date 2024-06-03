import React, { useEffect, useState, useMemo } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
import UpdateIcon from "@mui/icons-material/Update";
import { useSelector, useDispatch } from "react-redux";
import { overrideDriverSalary, fetchSalaries } from "../redux/driversSlice";
import { pulsar } from "ldrs";

const DriversSalary = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const driversSalaries = useSelector((state) => state.drivers.salaries);
  const status = useSelector((state) => state.drivers.salariesStatus);
  const error = useSelector((state) => state.drivers.salariesError);
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");

  const [editRowsModel, setEditRowsModel] = useState({});

  const netCarDriversSalary = useMemo(() => {
    const carDrivers = driversSalaries.filter(
      (driver) => driver.vehicle === "Car"
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
    },
    {
      field: "name",
      headerName: "Name",
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
      headerName: "Vehicle Type",
      flex: 0.75,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "mainOrder", // NEW
      headerName: "Main Orders",
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "additionalOrder", // NEW
      headerName: "Additional Orders",
      type: Number,
      editable: true,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "totalOrders", // NEW (main  + additional)
      headerName: "Total Orders",
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
      headerName: "Salary (Main Orders)",
      //editable: true,
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "salaryAdditionalOrders", // NEW
      headerName: "Salary (Additional Orders)",
      //editable: true,
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "finalSalary", // NEW
      headerName: "Final Salary",
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
      headerName: "Talabat Deduction",
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "companyDeductionAmount",
      headerName: "Company Deduction",
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "pettyCashDeductionAmount",
      headerName: "Petty Cash Deduction",
      headerAlign: "center",
      align: "center",
      //editable: true,
    },
    {
      field: "netSalary", // NEW
      headerName: "Net Salary",
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
      headerName: "Remarks",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
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
    sequenceNumber: "Total",
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
    dispatch(fetchSalaries(token));
    //}
  }, [token, dispatch]);

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

  return (
    <Box m="20px">
      <Header title="DRIVERS SALARY" subtitle="List of Drivers" />
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
        />
        <Box mt="20px">
          <Header title="NOTES" />
          <Typography color={colors.greenAccent[500]} fontSize={24}>
            Total net salary for car drivers:
            <strong> {netCarDriversSalary} KD</strong>
          </Typography>
          <Typography color={colors.greenAccent[500]} fontSize={24}>
            Total net salary for bike drivers:
            <strong> {netBikeDriversSalary} KD</strong>
          </Typography>
          <Typography color={colors.greenAccent[500]} fontSize={24}>
            Total monthly salary:
            <strong> {totalMonthlySalary} KD</strong>
          </Typography>
          <Typography color={colors.greenAccent[500]} fontSize={24}>
            Total monthly deduction:
            <strong> {totalMonthlyDeduction} KD</strong>
          </Typography>
          <Typography color={colors.greenAccent[500]} fontSize={24}>
            Total net salary:
            <strong> {totalNetSalary} KD</strong>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DriversSalary;
