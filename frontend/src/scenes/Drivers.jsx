import React, { useEffect } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { pulsar } from "ldrs";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchDrivers,
  deleteDriver,
  deactivateDriver,
} from "../redux/driversSlice";
import { useTranslation } from "react-i18next";

const Drivers = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const drivers = useSelector((state) => state.drivers.drivers);
  const status = useSelector((state) => state.drivers.status);
  const error = useSelector((state) => state.drivers.error);
  const { t } = useTranslation();
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");
  const navigate = useNavigate();

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "NO.",
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
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
      field: "phone",
      headerName: t("phone"),
    },
    {
      field: "idNumber",
      headerName: t("civilId"),
      type: Number,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "carPlateNumber",
      headerName: t("carPlateNumber"),
    },
    {
      field: "contractType",
      headerName: t("contractType"),
    },
    {
      field: "actions",
      headerName: t("actions"),
      width: 150,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
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
            onClick={() => handleDelete(params.row._id)}
            startIcon={<DeleteIcon />}
          ></Button>
        </Box>
      ),
    },
    {
      field: "deactivate",
      headerName: t("deactivate"),
      width: 150,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            size="small"
            style={{ marginRight: 8 }}
            onClick={() => handleDeactivation(params.row._id)}
            startIcon={<BlockOutlinedIcon />}
          ></Button>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    dispatch(fetchDrivers(token));
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
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="end"
          mt="20px"
        >
          Error: {error}
          <Button
            style={{ marginTop: "24px" }}
            type="submit"
            color="secondary"
            variant="contained"
            onClick={() => navigate("/")}
          >
            Back to Drivers page
          </Button>
        </Box>
      </div>
    );
  }

  const handleEdit = (rowData) => {
    navigate(`/driver-profile/${rowData._id}`);
  };

  const handleDelete = async (driverId) => {
    try {
      dispatch(deleteDriver(driverId));
    } catch (error) {
      console.error("Error deleting driver:", error);
    }
  };

  const handleDeactivation = async (driverId) => {
    try {
      dispatch(deactivateDriver(driverId));
    } catch (error) {
      console.error("Error deactivating driver:", error);
    }
  };

  const handleViewInactiveDrivers = () => {
    navigate("/deactivated-drivers");
  };

  return (
    <Box m="20px">
      <Header title={t("DRIVERS")} subtitle={t("manageDriverMembers")} />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt="20px"
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleViewInactiveDrivers}
        >
          View Inactive Drivers
        </Button>
      </Box>
      <Box
        mt="40px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
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
          rows={Array.isArray(drivers) ? drivers : []}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default Drivers;
