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
  MenuItem,
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
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { toast } from "react-toastify";
import { fetchUsers } from "../redux/usersSlice";
import { fetchDrivers } from "../redux/driversSlice";

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
            company: driver.contractType,
            idNumber: driver.idNumber,
            vehicle: driver.vehicle || "Car",
            workNumber: driver.employeeCompanyNumber || "",
            // Preserve the current archiveNumber if it exists
            archiveNumber: params.row.archiveNumber || "",
          };
        }
      } else if (type === "user") {
        const user = users.find((u) => u._id === id);
        if (user) {
          updates = {
            fullName: `${user.firstName} ${user.lastName}`,
            company: "نجمة الوسام",
            idNumber: user.identification,
            vehicle: "None",
            workNumber: user.employeeCompanyNumber || "",
            // Preserve the current archiveNumber if it exists
            archiveNumber: params.row.archiveNumber || "",
          };
        }
      }

      // Store all the updates in rowModifications
      setRowModifications((prev) => ({
        ...prev,
        [params.id]: updates, // Store all fields, not just the changed ones
      }));

      setEditedRows((prev) => ({
        ...prev,
        [params.id]: true,
      }));

      // Update all fields in the grid
      Object.entries(updates).forEach(([field, value]) => {
        params.api.setEditCellValue(
          {
            id: params.id,
            field,
            value,
          },
          true
        ); // Add true to commit the changes immediately
      });
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
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <Select
            value={selectValue}
            onChange={handleChange}
            displayEmpty
            sx={{
              backgroundColor: colors.primary[400],
              color: colors.grey[100],
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.grey[100],
              },
              "& .MuiSvgIcon-root": {
                color: colors.grey[100],
              },
              "&:hover": {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.greenAccent[500],
                },
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: colors.primary[400],
                  "& .MuiMenuItem-root": {
                    color: colors.grey[100],
                    "&:hover": {
                      bgcolor: colors.greenAccent[800],
                    },
                  },
                  "& .MuiListSubheader-root": {
                    color: colors.greenAccent[500],
                    bgcolor: colors.primary[400],
                  },
                },
              },
            }}
          >
            <MenuItem value="">
              <em>{t("selectName")}</em>
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
      </Box>
    );
  };

  const handleFileUpdate = async (archiveId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";

    input.onchange = async (e) => {
      setIsSubmitting(true);
      try {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("uploadedFile", file);

        await dispatch(
          updateArchive({
            archiveId,
            modifications: formData,
          })
        ).unwrap();
      } catch (error) {
        console.error("Error updating file:", error);
        toast.error(t("fileUpdateError"), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    input.click();
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
      renderCell: (params) => (
        <Box display="flex" justifyContent="flex-start" width="100%">
          {params.value || ""}
        </Box>
      ),
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
      preProcessEditCellProps: (params) => {
        const hasError = params.props.value === "";
        return { ...params.props, error: hasError };
      },
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
      flex: 1,
      width: 300,
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
              onClick={() => handleFileUpdate(params.row._id)}
              startIcon={<FileUploadIcon />}
            >
              {t("updateFile")}
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
    const hasNameChange = newRow.fullName !== oldRow.fullName;

    if (hasNameChange) {
      // If it's a name change, return oldRow to let the EditCell handle it
      return oldRow;
    } else {
      // For archiveNumber updates, merge with existing modifications
      setRowModifications((prev) => ({
        ...prev,
        [newRow._id]: {
          ...(prev[newRow._id] || {}), // Keep existing modifications
          archiveNumber: newRow.archiveNumber, // Add/update archiveNumber
        },
      }));

      setEditedRows((prev) => ({
        ...prev,
        [newRow._id]: true,
      }));

      return newRow;
    }
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

      // Ensure we have all the necessary fields including archiveNumber
      const updatedModifications = {
        ...modifications,
        workNumber: modifications.workNumber || row.workNumber,
        company: modifications.company || row.company,
        archiveNumber: modifications.archiveNumber || row.archiveNumber,
      };

      await dispatch(
        updateArchive({
          archiveId: row._id,
          modifications: updatedModifications,
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

      // Refresh the archives data
      dispatch(fetchArchives());
    } catch (error) {
      console.error("Error updating archive:", error);
      toast.error(t("updateError"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
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
