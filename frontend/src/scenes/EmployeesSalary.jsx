import React, { useEffect } from "react";
import {  Box, Button, useTheme } from "@mui/material";
import Header from "../components/Header";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import UpdateIcon from "@mui/icons-material/Update";
import { pulsar } from "ldrs";
import { useSelector, useDispatch } from "react-redux";
import { fetchSalaries, updateAdditionalSalary } from "../redux/usersSlice";

const EmployeesSalary = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();

  const status = useSelector((state) => state.user.salariesStatus);
  const salaries = useSelector((state) => state.users.salaries);
  const error = useSelector((state) => state.user.error);
  

  

  

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "NO.",
      flex: 0.25,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1.25,
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
      flex: 0.75,
      type: Number,
      editable: false,
    },
    {
      field: "additionalSalary",
      headerName: "Additional Salary",
      flex: 1,
      editable: true,
      type: Number,
    },
    {
      field: "totalSalary",
      headerName: "Total Salary",
      flex: 1,
      renderCell: ({ row: { additionalSalary, mainSalary, companyDeductionAmount } }) => {
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            borderRadius="4px"
          >
            {Number(additionalSalary) + Number(mainSalary) - Number(companyDeductionAmount)}
          </Box>
        );
      },
    },
    {
      field: "companyDeductionAmount",
      headerName: "Company Deduction",
      flex: 1,
      //editable: true, //Intentionally commented this as deductions should be done through deduction form only
      type: Number,
    },
    {
      field: "deductionReason",
      headerName: "Deduction Reason",
      flex: 1,
      //editable: true, //Intentionally commented this as deductions should be done through deduction form only
      type: String,
    },
    {
      field: "remarks",
      headerName: "Remarks",
      flex: 1,
      editable: true,
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 100,
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
              startIcon={<UpdateIcon />}
            ></Button>
          </Box>
        );
      },
    },
  ];

  useEffect(() => {
    
    dispatch(fetchSalaries());
    
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
      const { additionalSalary, remarks } = row;
      dispatch(
        updateAdditionalSalary({ userId: row._id, values: { additionalSalary, remarks } })
      );
    } catch (error) {
      console.error("Row does not have a valid _id field:", row);
    }
  };

  

  

  return (
    <Box m="20px">
      <Header title="EMPLOYEES SALARY" subtitle="Employees Salary Page" />
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
          rows={Array.isArray(salaries) ? salaries : []}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default EmployeesSalary;
