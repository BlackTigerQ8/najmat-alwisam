import React, { useEffect, useState } from "react";
import { Typography, Box, Button, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
// import { mockDataTeam } from "../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers } from "../redux/usersSlice";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users); // <-- Select users from state
  const status = useSelector((state) => state.user.status);
  const error = useSelector((state) => state.user.error);
  const navigate = useNavigate();

  const token = useSelector((state) => state.user.token);

  const columns = [
    {
      field: "_id",
      headerName: "ID",
    },
    {
      field: "name",
      headerName: "Name",
      flex: 0.75,
      cellClassName: "name-column--cell",
      renderCell: ({ row: { firstName, lastName } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            display="flex"
            justifyContent="center"
            borderRadius="4px"
          >
            {firstName} {lastName}
          </Box>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "identification",
      headerName: "Civil ID",
      type: Number,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "passport",
      headerName: "Passport",
    },
    {
      field: "role",
      headerName: "Access Level",
      flex: 1,
      headerAlign: "center",
      renderCell: ({ row: { role } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            display="flex"
            justifyContent="center"
            backgroundColor={
              role === "admin"
                ? colors.greenAccent[600]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {role === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {role === "manager" && <SecurityOutlinedIcon />}
            {role === "user" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {role}
            </Typography>
          </Box>
        );
      },
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
              onClick={() => handleEdit(params.row)}
              startIcon={<EditIcon />}
            ></Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleDelete(params.row.id)}
              startIcon={<DeleteIcon />}
            ></Button>
          </Box>
        );
      },
    },
  ];

  useEffect(() => {
    if (status === "succeeded") {
      dispatch(fetchUsers(token));
    }
  }, [token]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "failed") {
    return <div>Error: {error}</div>;
  }

  const handleEdit = (rowData) => {
    // Here you can navigate to an edit page with rowData or open an edit modal/dialog
    navigate(`/profile/${rowData.id}`);
  };

  const handleDelete = (userId) => {
    // Here you can call an API to delete the user or remove them from your state
    console.log("Deleting user with ID:", userId);
  };

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Managing the Team Members" />
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
          rows={Array.isArray(users) ? users : []}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default Team;
