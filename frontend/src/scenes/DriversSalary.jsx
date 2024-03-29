import React, { useEffect, useState } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
import UpdateIcon from "@mui/icons-material/Update";
import { useSelector, useDispatch } from "react-redux";
import { fetchDrivers, updateDriver } from "../redux/driversSlice";
import { pulsar } from "ldrs";

const DriversSalary = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const drivers = useSelector((state) => state.drivers.drivers);
  const status = useSelector((state) => state.drivers.status);
  const error = useSelector((state) => state.drivers.error);
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");

  const [editRowsModel, setEditRowsModel] = useState({});

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
      field: "mainOrders", // NEW
      headerName: "Main Orders",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "additionalOrders", // NEW
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
    },
    {
      field: "salaryBasedOnMainOrders", // NEW
      headerName: "Salary (Main Orders)",
      editable: true,
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "salaryBasedOnAdditionalOrders", // NEW
      headerName: "Salary (Additional Orders)",
      editable: true,
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "finalSalary", // NEW
      headerName: "Final Salary",
      editable: true,
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
    //if (status === "succeeded") {
    dispatch(fetchDrivers(token));
    //}
  }, [token]);

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
          rows={Array.isArray(drivers) ? drivers : []}
          columns={columns}
          getRowId={(row) => row._id}
          editRowsModel={editRowsModel}
          onEditRowsModelChange={(newModel) => setEditRowsModel(newModel)}
        />
      </Box>
    </Box>
  );
};

export default DriversSalary;
