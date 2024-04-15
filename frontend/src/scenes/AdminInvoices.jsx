import React, { useEffect, useState, useMemo } from "react";
import { Typography, Box, Button, useTheme } from "@mui/material";
import Header from "../components/Header";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import UpdateIcon from "@mui/icons-material/Update";
import { pulsar } from "ldrs";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchDrivers, updateDriver } from "../redux/driversSlice";
import {
  fetchInvoices,
  createDriverInvoice,
  fetchEmployeeInvoices
} from "../redux/invoiceSlice";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

const AdminInvoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const drivers = useSelector((state) => state.drivers.drivers);
  const status = useSelector((state) => state.drivers.status);
  const error = useSelector((state) => state.drivers.error);
  const invoices = useSelector((state) => state.invoice?.driverInvoices);
  const userInvoices = useSelector((state) => state.invoice?.employeeInvoices);

  const combinedInvoices = useMemo(() => {

    const combinedInvoices = []

    let sequenceNumber = 1;

    for(const driverInvoice of invoices){
    if(!driverInvoice.additionalSalary && !driverInvoice.companyDeductionAmount && !driverInvoice.talabatDeductionAmount){
      continue;
    }

      combinedInvoices.push({
        id: driverInvoice._id,
        sequenceNumber,
        additionalSalary: driverInvoice.additionalSalary,
        companyDeductionAmount: driverInvoice.companyDeductionAmount,
        deductionReason: driverInvoice.deductionReason,
        talabatDeductionAmount: driverInvoice.talabatDeductionAmount,
        ...driverInvoice.driver
      });

      sequenceNumber++;
    }

    for(const userInvoice of userInvoices){
      if(!userInvoice.additionalSalary && !userInvoice.companyDeductionAmount){
        continue;
      }
  
        combinedInvoices.push({
          id: userInvoice._id,
          sequenceNumber,
          additionalSalary: userInvoice.additionalSalary,
          companyDeductionAmount: userInvoice.companyDeductionAmount,
          deductionReason: userInvoice.deductionReason,
          talabatDeductionAmount: 0,
          ...userInvoice.user
        });
  
        sequenceNumber++;
      }

    return combinedInvoices;
  }, [invoices,userInvoices])

  console.log('invoices',invoices);
  console.log('userInvoices', userInvoices)
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");

  const navigate = useNavigate();

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "NO.",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1.75,
      cellClassName: "name-column--cell",
      renderCell: ({ row: { firstName, lastName } }) => {
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            borderRadius="4px"
          >
            {firstName} {lastName}
          </Box>
        );
      },
    },
    {
      field: "mainSalary",
      headerName: "Main Salary",
      flex: 1,
    },
    {
      field: "additionalSalary",
      headerName: "Additional Salary",
      flex: 1,
    },
    {
      field: "talabatDeductionAmount",
      headerName: "Talabat deduction",
      flex: 1,
    },
    {
      field: "companyDeductionAmount",
      headerName: "Company deduction",
      flex: 1,
    },
    {
      field: "deductionReason",
      headerName: "Deduction Reason",
      flex: 1,
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
        return (
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginRight: 8 }}
              onClick={() => handleUpdate(params.row)}
              startIcon={<CloseOutlinedIcon />}
            ></Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleUpdate(params.row._id)}
              startIcon={<CheckOutlinedIcon />}
            ></Button>
          </Box>
        );
      },
    },
  ];

  useEffect(() => {
    //if (status === "succeeded") {
    dispatch(fetchDrivers(token));
    dispatch(fetchInvoices(token));
    dispatch(fetchEmployeeInvoices(token));
    //}
  }, [dispatch, token]);

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
      const { cost, order, hour } = row;
      dispatch(
        updateDriver({ driverId: row._id, values: { cost, order, hour } })
      );
    } catch (error) {
      console.error("Row does not have a valid _id field:", row);
    }
  };

  const handleUpdateAll = () => {
    // Update all rows in the DataGrid
    selectedRowIds.forEach((id) => {
      const row = drivers.find((driver) => driver._id === id);
      if (row) {
        console.log(row);
        handleUpdate(row);
      }
    });
  };

  return (
    <Box m="20px">
      <Header title="DEDUCTION SALARY" subtitle="Deduction Salary Page" />
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
          rows={Array.isArray(combinedInvoices) ? combinedInvoices : []}
          columns={columns}
        />
      </Box>
    </Box>
  );
};

export default AdminInvoices;
