import React, { useEffect, useState } from "react";
import {
  Box,
  useTheme,
  Button,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { tokens } from "../theme";
import SettingsBackupRestoreOutlinedIcon from "@mui/icons-material/SettingsBackupRestoreOutlined";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";
import { fetchInactiveDrivers, activateDriver } from "../redux/driversSlice";
import { useSelector, useDispatch } from "react-redux";

const DeactivatedDrivers = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const deactivatedDrivers = useSelector(
    (state) => state.drivers.inactiveDrivers
  );
  const status = useSelector((state) => state.drivers.inactiveDriversStatus);
  const error = useSelector((state) => state.drivers.inactiveDriversError);

  const [openRetrieveModal, setOpenRetrieveModal] = useState(false);
  const [driverToRetrieve, setDriverToRetrieve] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              onClick={() => handleRetrieveClick(params.row._id)}
              startIcon={<SettingsBackupRestoreOutlinedIcon />}
            ></Button>
          </Box>
        );
      },
    },
  ];

  // const handleRetrieve = async (driverId) => {
  //   dispatch(activateDriver({ driverId }));
  // };

  const handleRetrieveClick = (driverId) => {
    setDriverToRetrieve(driverId);
    setOpenRetrieveModal(true);
  };

  const handleConfirmRetrieve = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(activateDriver({ driverId: driverToRetrieve }));
    } catch (error) {
      console.error("Error reactivating driver:", error);
    } finally {
      setIsSubmitting(false);
      setOpenRetrieveModal(false);
      setDriverToRetrieve(null);
    }
  };

  const handleCloseModal = () => {
    setOpenRetrieveModal(false);
    setDriverToRetrieve(null);
  };

  const ConfirmationModal = () => (
    <Dialog
      open={openRetrieveModal}
      onClose={handleCloseModal}
      PaperProps={{
        style: {
          backgroundColor: colors.primary[400],
          border: `1px solid ${colors.primary[500]}`,
          borderRadius: "4px",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h4" color={colors.grey[100]}>
          {t("confirmReactivate")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography color={colors.grey[100]}>
          {t("confirmReactivateMessage")}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: "20px" }}>
        <Button
          onClick={handleCloseModal}
          variant="contained"
          sx={{
            backgroundColor: colors.grey[500],
            "&:hover": { backgroundColor: colors.grey[400] },
          }}
        >
          {t("cancel")}
        </Button>
        <Button
          onClick={handleConfirmRetrieve}
          variant="contained"
          color="secondary"
          sx={{
            marginLeft: "10px",
            backgroundColor: colors.greenAccent[500],
            "&:hover": { backgroundColor: colors.greenAccent[400] },
          }}
        >
          {t("confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );

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
        <Alert severity="error">Error: {error}</Alert>
      </div>
    );
  }

  return (
    <Box m="20px">
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
        open={isSubmitting}
      >
        <l-pulsar
          size="70"
          speed="1.75"
          color={colors.greenAccent[500]}
        ></l-pulsar>
      </Backdrop>
      <ConfirmationModal />
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
