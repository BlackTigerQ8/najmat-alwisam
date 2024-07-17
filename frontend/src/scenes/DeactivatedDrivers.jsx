import React, { useEffect } from "react";
import { Box, useTheme, Button } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { tokens } from "../theme";
import SettingsBackupRestoreOutlinedIcon from "@mui/icons-material/SettingsBackupRestoreOutlined";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";
import { fetchInactiveDrivers,activateDriver } from "../redux/driversSlice";
import { useSelector, useDispatch } from "react-redux";

const DeactivatedDrivers = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const deactivatedDrivers = useSelector((state) =>
    state.drivers.inactiveDrivers
  );
  const status = useSelector((state) => state.drivers.inactiveDriversStatus);
  const error = useSelector((state) => state.drivers.inactiveDriversError);

  useEffect(() => {
    dispatch(fetchInactiveDrivers(token));
  }, []);

  

  const token = localStorage.getItem("token");

  const columns = [
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
      field: "idNumber",
      headerName: t("civilId"),
      type: Number,
      headerAlign: "left",
      align: "left",
      flex: 1,
    },

    {
      field: "passportNumber",
      headerName: t("passport"),
      flex: 1,
    },
    {
      field: "contractType",
      headerName: t("contractType"),
      flex: 1,
    },
    {
      field: "actions",
      headerName: t("reactivate"),
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
              onClick={() => handleRetrieve(params.row._id)}
              startIcon={<SettingsBackupRestoreOutlinedIcon />}
            ></Button>
          </Box>
        );
      },
    },
  ];

  const handleRetrieve = async (driverId) => {
    dispatch(activateDriver({driverId}))
  };

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
        title={t("deactivatedDriversTitle")}
        subtitle={t("deactivatedDriversSubtitle")}
      />

      <Box
        mt="40px"
        mb="40px"
        height="65vh"
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
          rows={deactivatedDrivers}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default DeactivatedDrivers;
