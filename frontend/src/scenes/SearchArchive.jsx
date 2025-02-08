import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  useTheme,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  ListSubheader,
  Select,
  FormControl,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { DataGrid } from "@mui/x-data-grid";
import {
  deleteArchive,
  fetchArchives,
  updateArchive,
} from "../redux/archiveSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { toast } from "react-toastify";
import { fetchUsers } from "../redux/usersSlice";
import { fetchDrivers } from "../redux/driversSlice";
import { MenuItem } from "react-pro-sidebar";

const SearchArchive = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const { status, error, archives } = useSelector((state) => state.archive);
  const { users } = useSelector((state) => state.users);
  const { drivers } = useSelector((state) => state.drivers);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [archiveToDelete, setArchiveToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rowModifications, setRowModifications] = useState({});
  const [editedRows, setEditedRows] = useState({});

  useEffect(() => {
    dispatch(fetchArchives());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUsers(token));
      dispatch(fetchDrivers(token));
    }
  }, [dispatch]);

  const EditCell = ({ params, drivers, users, t }) => {
    const [selectValue, setSelectValue] = useState("");

    const handleChange = (event) => {
      const selectedValue = event.target.value;
      setSelectValue(selectedValue);

      if (!selectedValue) return;

      const [type, id] = selectedValue.split(":");

      let updates = {};
      if (type === "driver") {
        const driver = drivers.find((d) => d._id === id);
        if (driver) {
          updates = {
            fullName: `${driver.firstName} ${driver.lastName}`,
            company: "Talabat",
            idNumber: driver.idNumber,
            vehicle: driver.vehicle || "Car",
            workNumber: driver.employeeCompanyNumber,
          };
        }
      } else if (type === "user") {
        const user = users.find((u) => u._id === id);
        if (user) {
          updates = {
            fullName: `${user.firstName} ${user.lastName}`,
            company: user.company || "",
            idNumber: user.identification,
            vehicle: "None",
            workNumber: "",
          };
        }
      }

      // Update all fields
      Object.entries(updates).forEach(([field, value]) => {
        params.api.setEditCellValue({
          id: params.id,
          field,
          value,
        });
      });

      // Exit edit mode after a short delay
      setTimeout(() => {
        params.api.setRowMode(params.id, "view");
      }, 100);
    };

    // Set initial value when the cell enters edit mode
    useEffect(() => {
      const fullName = params.value;
      const matchingDriver = drivers.find(
        (d) => `${d.firstName} ${d.lastName}` === fullName
      );
      if (matchingDriver) {
        setSelectValue(`driver:${matchingDriver._id}`);
        return;
      }

      const matchingUser = users.find(
        (u) => `${u.firstName} ${u.lastName}` === fullName
      );
      if (matchingUser) {
        setSelectValue(`user:${matchingUser._id}`);
      }
    }, [params.value, drivers, users]);

    return (
      <FormControl fullWidth>
        <Select
          value={selectValue}
          onChange={handleChange}
          sx={{ width: "100%" }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <ListSubheader>{t("drivers")}</ListSubheader>
          {drivers.map((driver) => (
            <MenuItem key={driver._id} value={`driver:${driver._id}`}>
              {driver.firstName} {driver.lastName}
            </MenuItem>
          ))}
          <ListSubheader>{t("users")}</ListSubheader>
          {users
            .filter((user) => user.role !== "Admin")
            .map((user) => (
              <MenuItem key={user._id} value={`user:${user._id}`}>
                {user.firstName} {user.lastName} - ({user.role})
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    );
  };

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "NO.",
    },
    {
      field: "fullName",
      headerName: t("fullName"),
      flex: 1,
      editable: true,
      renderEditCell: (params) => (
        <EditCell params={params} drivers={drivers} users={users} t={t} />
      ),
      renderCell: (params) => {
        if (!params.value) return null;
        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "company",
      headerName: t("company"),
      editable: false,
    },
    {
      field: "idNumber",
      headerName: t("idNumber"),
      type: Number,
      editable: false,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "vehicle",
      headerName: t("vehicle"),
      editable: false,
    },
    {
      field: "workNumber",
      headerName: t("workNumber"),
      editable: false,
    },
    {
      field: "archiveNumber",
      headerName: t("archiveNumber"),
      editable: true,
    },
    {
      field: "preview",
      headerName: t("preview"),
      width: 150,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (!params.row.uploadedFile) return "No File";
        return (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleViewFile(params.row)}
          >
            <RemoveRedEyeOutlinedIcon />
          </Button>
        );
      },
    },
    {
      field: "actions",
      headerName: t("actions"),
      width: 200,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const rowId = params.row._id;
        const hasChanges = Boolean(
          editedRows[rowId] && rowModifications[rowId]
        );

        return (
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleUpdate(params.row)}
              disabled={!hasChanges}
              startIcon={<SaveIcon />}
            >
              {t("save")}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleDelete(params.row._id)}
              startIcon={<DeleteIcon />}
            />
          </Box>
        );
      },
    },
  ];

  const handleViewFile = (values) => {
    const fileUrl = values?.uploadedFile
      ? `${process.env.REACT_APP_API_URL}/${values.uploadedFile}`
      : null;
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      toast.error(t("noFileAvailable"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  // const processRowUpdate = (newRow, oldRow) => {
  //   const id = newRow._id;
  //   const changes = {};

  //   Object.keys(newRow).forEach((field) => {
  //     if (newRow[field] !== oldRow[field]) {
  //       changes[field] = newRow[field];
  //     }
  //   });

  //   if (Object.keys(changes).length > 0) {
  //     setRowModifications((prev) => ({
  //       ...prev,
  //       [id]: {
  //         ...(prev[id] || {}),
  //         ...changes,
  //       },
  //     }));

  //     setEditedRows((prev) => ({
  //       ...prev,
  //       [id]: true,
  //     }));
  //   }

  //   return newRow;
  // };

  const processRowUpdate = (newRow, oldRow) => {
    return oldRow; // No direct cell editing needed
  };

  const handleProcessRowUpdateError = (error) => {
    console.error("Error updating row:", error);
    toast.error(t("updateError"), {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  const handleUpdate = async (row) => {
    setIsSubmitting(true);
    try {
      const modifications = rowModifications[row._id];

      if (!modifications || Object.keys(modifications).length === 0) {
        return;
      }

      await dispatch(
        updateArchive({
          archiveId: row._id,
          modifications,
        })
      ).unwrap();

      // Clear modifications for this row
      setRowModifications((prev) => {
        const newState = { ...prev };
        delete newState[row._id];
        return newState;
      });

      setEditedRows((prev) => {
        const newState = { ...prev };
        delete newState[row._id];
        return newState;
      });
    } catch (error) {
      console.error("Error updating archive:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (archiveId) => {
    setArchiveToDelete(archiveId);
    setOpenModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(deleteArchive(archiveToDelete));
    } catch (error) {
      console.error("Error deleting archive:", error);
    } finally {
      setIsSubmitting(false);
      setOpenModal(false);
      setArchiveToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setArchiveToDelete(null);
  };

  // Add ConfirmationModal component
  const ConfirmationModal = () => (
    <Dialog
      open={openModal}
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
          {t("confirmDelete")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography color={colors.grey[100]}>
          {t("confirmDeleteMessage")}
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

  if (error) {
    return <Alert severity="error">{error}</Alert>;
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
        title={t("searchArchiveTitle")}
        subtitle={t("searchArchiveSubtitle")}
      />
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
        <Box display="flex" justifyContent="start" mb="20px">
          <Button
            onClick={() => navigate("/")}
            color="secondary"
            variant="contained"
          >
            {t("backToMainSystem")}
          </Button>
        </Box>
        <DataGrid
          rows={Array.isArray(archives) ? archives : []}
          columns={columns}
          getRowId={(row) => row._id || row.sequenceNumber}
          editMode="cell"
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
        />
      </Box>
    </Box>
  );
};

export default SearchArchive;
