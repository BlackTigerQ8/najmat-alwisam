import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Button,
  useTheme,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../theme";
// import { mockDataTeam } from "../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers, deleteUser } from "../redux/usersSlice";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users);
  const status = useSelector((state) => state.user.status);
  const error = useSelector((state) => state.user.error);
  const filteredUsers = users.filter((user) => user.role !== "Admin");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const token =
    useSelector((state) => state.user.token) || localStorage.getItem("token");

  const [openModal, setOpenModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const rowsWithSum = [...users];

  const columns = [
    {
      field: "sequenceNumber",
      headerName: t("no"),
      flex: 0.2,
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
      headerName: t("email"),
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "phone",
      headerName: t("phone"),
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    // {
    //   field: "identification",
    //   headerName: t("civilId"),
    //   type: Number,
    //   headerAlign: "left",
    //   align: "left",
    // },
    // {
    //   field: "passport",
    //   headerName: t("passport"),
    // },
    {
      field: "mainSalary",
      headerName: t("mainSalary"),
      type: Number,
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "role",
      headerName: t("accessLevel"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: ({ row: { role } }) => {
        return (
          <Box
            width="80%"
            m="0 auto"
            display="flex"
            justifyContent="center"
            backgroundColor={
              role === "Admin"
                ? colors.greenAccent[600]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {role === "Admin" && <AdminPanelSettingsOutlinedIcon />}
            {role === "Manager" && <SecurityOutlinedIcon />}
            {role === "Employee" && <PersonOutlineOutlinedIcon />}
            {role === "Accountant" && <PointOfSaleOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {t(role)}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: t("actions"),
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
              onClick={() => handleDelete(params.row._id)}
              startIcon={<DeleteIcon />}
            ></Button>
          </Box>
        );
      },
    },
  ];

  useEffect(() => {
    //if (status === "succeeded") {
    dispatch(fetchUsers(token));
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
    return <div>Error: {error}</div>;
  }

  const handleEdit = (rowData) => {
    // Here you can navigate to an edit page with rowData or open an edit modal/dialog
    navigate(`/user-profile/${rowData._id}`);
  };

  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setOpenModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(deleteUser(userToDelete));
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsSubmitting(false);
      setOpenModal(false);
      setUserToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setUserToDelete(null);
  };

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
      <Header title={t("TEAM")} subtitle={t("manageTeamMembers")} />
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
          rows={Array.isArray(filteredUsers) ? filteredUsers : []}
          columns={columns}
          getRowId={(row) => row._id}
          // components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default Team;
