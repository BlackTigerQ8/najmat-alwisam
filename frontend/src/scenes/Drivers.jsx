import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  useTheme,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
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

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [driverToDeactivate, setDriverToDeactivate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const rowsWithSum = [...drivers];
  const columns = [
    {
      field: "sequenceNumber",
      headerName: t("no"),
      flex: 0.2,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        if (params.row._id === "sum-row") {
          return "";
        }
        const currentIndex = rowsWithSum.findIndex(
          (row) => row._id === params.row._id
        );
        return currentIndex + 1;
      },
      sortable: false,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
      align: "center",
      headerAlign: "center",
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
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "idNumber",
      headerName: t("civilId"),
      type: Number,
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "carPlateNumber",
      headerName: t("carPlateNumber"),
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "contractType",
      headerName: t("contractType"),
      flex: 1,
      align: "center",
      headerAlign: "center",
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
            onClick={() => {
              handleDeactivation(params.row._id);
            }}
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

  const handleDelete = (driverId) => {
    setDriverToDelete(driverId);
    setOpenDeleteModal(true);
  };

  const handleDeactivation = (driverId) => {
    setDriverToDeactivate(driverId);
    setOpenDeactivateModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(deleteDriver(driverToDelete));
    } catch (error) {
      console.error("Error deleting driver:", error);
    } finally {
      setIsSubmitting(false);
      setOpenDeleteModal(false);
      setDriverToDelete(null);
    }
  };

  const handleConfirmDeactivate = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(deactivateDriver({ driverId: driverToDeactivate }));
    } catch (error) {
      console.error("Error deactivating driver:", error);
    } finally {
      setIsSubmitting(false);
      setOpenDeactivateModal(false);
      setDriverToDeactivate(null);
    }
  };

  const handleCloseModals = () => {
    setOpenDeleteModal(false);
    setOpenDeactivateModal(false);
    setDriverToDelete(null);
    setDriverToDeactivate(null);
  };

  const ConfirmationModals = () => (
    <>
      <Dialog
        open={openDeleteModal}
        onClose={handleCloseModals}
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
            {t("confirmDeleteDriver")}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography color={colors.grey[100]}>
            {t("confirmDeleteDriverMessage")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "20px" }}>
          <Button
            onClick={handleCloseModals}
            variant="contained"
            sx={{
              backgroundColor: colors.grey[500],
              "&:hover": { backgroundColor: colors.grey[400] },
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirmDelete}
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

      <Dialog
        open={openDeactivateModal}
        onClose={handleCloseModals}
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
            {t("confirmDeactivate")}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography color={colors.grey[100]}>
            {t("confirmDeactivateMessage")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "20px" }}>
          <Button
            onClick={handleCloseModals}
            variant="contained"
            sx={{
              backgroundColor: colors.grey[500],
              "&:hover": { backgroundColor: colors.grey[400] },
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirmDeactivate}
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
    </>
  );

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
      <ConfirmationModals />
      <Header title={t("DRIVERS")} subtitle={t("manageDriverMembers")} />
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
