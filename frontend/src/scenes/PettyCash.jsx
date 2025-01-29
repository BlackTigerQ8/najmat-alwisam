import React, { useEffect, useMemo, useRef, useState } from "react";
import * as yup from "yup";
import {
  Box,
  useTheme,
  Button,
  TextField,
  Typography,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  ListSubheader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { tokens } from "../theme";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchPettyCash,
  createPettyCash,
  searchPettyCash,
  updatePettyCash,
  deletePettyCash,
} from "../redux/pettyCashSlice";
import { pulsar } from "ldrs";
import { fetchDrivers } from "../redux/driversSlice";
import { fetchUsers } from "../redux/usersSlice";
import { fetchAllSpendTypes } from "../redux/spendTypeSlice";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import PrintableTable from "./PrintableTable";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

const newPettyCashInitialValues = {
  requestApplicant: "",
  requestDate: "",
  spendsDate: "",
  spendsReason: "",
  cashAmount: "",
  spendType: "",
  spendsRemarks: "",
  deductedFromUser: "",
  deductedFromDriver: "",
  currentBalance: "",
  serialNumber: "",
};

const pettyCashRequestSchema = yup.object().shape({
  startDate: yup.string(),
  endDate: yup
    .string()
    .test("dates", "End date must be after start date", function (endDate) {
      const { startDate } = this.parent;
      if (!startDate || !endDate) return true;
      return new Date(endDate) >= new Date(startDate);
    }),
});

const addNewPettyCashSchema = yup.object().shape({
  requestApplicant: yup.string().required(),
  requestDate: yup.string().required(),
  spendsDate: yup.string().required(),
  spendsReason: yup.string().required(),
  cashAmount: yup.string().required(),
  spendType: yup.string().required(),
  spendsRemarks: yup.string(),
  deductedFromUser: yup.string(),
  deductedFromDriver: yup.string(),
  currentBalance: yup.number(),
});

const PettyCash = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const pettyCash = useSelector((state) => state.pettyCash.pettyCash);
  const pageStatus = useSelector((state) => state.pettyCash.status);
  const error = useSelector((state) => state.pettyCash.error);
  const componentRef = useRef();
  const [editedRows, setEditedRows] = useState({});
  const [rowModifications, setRowModifications] = useState({});
  const [searchDates, setSearchDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const pettyCashSearchResults = useSelector(
    (state) => state.pettyCash.searchResults
  );
  const searchStatus = useSelector((state) => state.pettyCash.searchStatus);

  const status = searchStatus || pageStatus;

  const drivers = useSelector((state) => state.drivers.drivers);
  const users = useSelector((state) => state.users.users);
  const spendTypes = useSelector((state) => state.spendType.spendTypes);

  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Petty Cash Report",
  });

  async function handleFormSubmit(values) {
    try {
      dispatch(
        searchPettyCash({
          values,
        })
      );
      setSearchDates({
        startDate: values.startDate,
        endDate: values.endDate,
      });

      // TODO: Uncomment this later

      // dispatch(createNotification(buildNotificationAlert({
      //   driverId: values.selectedDriver,
      //   talabatDeductionAmount: values.talabatDeductionAmount,
      //   companyDeductionAmount: values.companyDeductionAmount,
      //   role: userInfo.role
      // })));
    } catch (error) {
      console.error("Row does not have a valid _id field:");
    }
  }

  const totalSpends = useMemo(
    () =>
      Number(
        pettyCash.reduce(
          (sum, pettyCash) => sum + (pettyCash.cashAmount || 0),
          0
        )
      ).toFixed(3),
    [pettyCash]
  );
  const totalAmountOnWorker = useMemo(
    () =>
      Number(
        pettyCash.reduce(
          (sum, pettyCash) =>
            sum +
            (pettyCash.deductedFromDriver || pettyCash.deductedFromUser
              ? pettyCash.cashAmount || 0
              : 0),
          0
        )
      ).toFixed(3),
    [pettyCash]
  );
  const totalAmountOnCompany = Number(
    totalSpends - totalAmountOnWorker
  ).toFixed(3);

  useEffect(() => {
    dispatch(fetchDrivers(token));
    dispatch(fetchUsers(token));
    dispatch(fetchAllSpendTypes(token));
  }, [token]);

  useEffect(() => {
    dispatch(fetchPettyCash());
  }, [dispatch]);

  const columns = [
    {
      field: "sequence",
      headerName: "NO.",
      editable: false,
      flex: 0.5,
    },
    {
      field: "requestApplicant",
      headerName: t("requestApplicant"),
      flex: 1,
      editable: true,
      renderEditCell: (params) => (
        <FormControl fullWidth>
          <Select
            value={params.value}
            onChange={(e) =>
              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: e.target.value,
              })
            }
          >
            {users.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.firstName} {user.lastName} - ({user.role})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
      renderCell: ({ row: { requestApplicant } }) => {
        const { firstName = undefined, lastName = undefined } = users.find(
          (u) => u._id === requestApplicant
        ) || {
          firstName: "Deleted",
          lastName: "User",
        };

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {firstName} {lastName}
          </Box>
        );
      },
    },
    {
      field: "serialNumber",
      headerName: t("serialNumber"),
      flex: 1,
      editable: true,
    },

    {
      field: "spendsDate",
      type: "date",

      valueFormatter: (params) => {
        const date = new Date(params.value);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      },
      headerName: t("spendsDate"),
      flex: 1,
      editable: true,
    },
    {
      field: "spendsReason",
      headerName: t("spendsReason"),
      flex: 1,
      editable: true,
    },
    {
      field: "cashAmount",
      headerName: t("cashAmount"),
      flex: 1,
      editable: true,
      type: "number",
    },
    {
      field: "spendType",
      headerName: t("spendTypes"),
      flex: 1,
      editable: true,
      renderEditCell: (params) => (
        <FormControl fullWidth>
          <Select
            value={params.value}
            onChange={(e) =>
              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: e.target.value,
              })
            }
          >
            {spendTypes.map((type) => (
              <MenuItem key={type._id} value={type._id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
      renderCell: ({ row: { spendType } }) => {
        const { name = undefined } = spendTypes.find(
          (s) => s._id === spendType
        ) || { name: undefined };

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {name}
          </Box>
        );
      },
    },
    {
      field: "spendsRemarks",
      headerName: t("remarks"),
      flex: 1,
      editable: true,
    },
    {
      field: "deductedFrom",
      headerName: t("deductedFrom"),
      editable: true,
      flex: 1,
      renderEditCell: (params) => {
        const handleChange = (event) => {
          const [type, id] = event.target.value.split(":");

          // Create updates object
          const updates = {
            deductedFromDriver: type === "driver" ? id : null,
            deductedFromUser: type === "user" ? id : null,
          };

          // Update the cell value immediately
          params.api.setEditCellValue({
            id: params.id,
            field: "deductedFromDriver",
            value: updates.deductedFromDriver,
          });
          params.api.setEditCellValue({
            id: params.id,
            field: "deductedFromUser",
            value: updates.deductedFromUser,
          });

          // Update the modifications state
          setRowModifications((prev) => ({
            ...prev,
            [params.id]: {
              ...(prev[params.id] || {}),
              ...updates,
            },
          }));

          // Mark row as edited
          setEditedRows((prev) => ({
            ...prev,
            [params.id]: true,
          }));
        };

        const currentValue = params.row.deductedFromDriver
          ? `driver:${params.row.deductedFromDriver}`
          : params.row.deductedFromUser
          ? `user:${params.row.deductedFromUser}`
          : "";

        return (
          <FormControl fullWidth>
            <Select value={currentValue} onChange={handleChange}>
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
      },
      renderCell: ({ row: { deductedFromDriver, deductedFromUser } }) => {
        if (!deductedFromDriver && !deductedFromUser) return null;

        const { firstName = undefined, lastName = undefined } =
          deductedFromDriver
            ? drivers.find((d) => d._id === deductedFromDriver) || {
                firstName: "Deleted",
                lastName: "Driver",
              }
            : users.find((u) => u._id === deductedFromUser) || {
                firstName: "Deleted",
                lastName: "User",
              };

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {firstName} {lastName}
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: t("actions"),
      flex: 1,
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
              color="secondary"
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={() => handleRowUpdate(rowId)}
              disabled={!hasChanges}
            >
              {t("save")}
            </Button>
            <Button
              color="error"
              variant="contained"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteClick(rowId)}
            >
              {t("delete")}
            </Button>
          </Box>
        );
      },
    },
  ];

  // Update the handleRowUpdate function
  const handleRowUpdate = async (id) => {
    try {
      const modifications = rowModifications[id];

      if (!modifications || Object.keys(modifications).length === 0) {
        return;
      }

      const formattedModifications = { ...modifications };

      if ("cashAmount" in formattedModifications) {
        formattedModifications.cashAmount = Number(
          formattedModifications.cashAmount
        );
      }
      if ("serialNumber" in formattedModifications) {
        formattedModifications.serialNumber = Number(
          formattedModifications.serialNumber
        );
      }
      if ("spendsDate" in formattedModifications) {
        formattedModifications.spendsDate = new Date(
          formattedModifications.spendsDate
        )
          .toISOString()
          .split("T")[0];
      }

      await dispatch(
        updatePettyCash({
          id,
          updates: formattedModifications,
        })
      ).unwrap();

      setEditedRows((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });

      setRowModifications((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });

      await dispatch(fetchPettyCash());
    } catch (error) {
      console.log(error);
    }
  };

  const processRowUpdate = (newRow, oldRow) => {
    const id = newRow._id;
    const changes = {};

    Object.keys(newRow).forEach((field) => {
      if (newRow[field] !== oldRow[field]) {
        changes[field] = newRow[field];
      }
    });

    if (Object.keys(changes).length > 0) {
      setRowModifications((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          ...changes,
        },
      }));

      setEditedRows((prev) => ({
        ...prev,
        [id]: true,
      }));
    }

    return newRow;
  };

  const handleProcessRowUpdateError = (error) => {
    console.log(error);
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

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deletePettyCash(deleteId)).unwrap();
      await dispatch(fetchPettyCash());
    } catch (error) {
      console.error("Failed to delete petty cash:", error);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

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
      <Header title={t("pettyCashTitle")} subtitle={t("pettyCashSubtitle")} />
      <Typography variant="h5" color="secondary" mb={2}>
        {t("searchPettyCash")}
      </Typography>
      <Formik
        initialValues={{
          startDate: searchDates.startDate,
          endDate: searchDates.endDate,
        }}
        validationSchema={pettyCashRequestSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(5, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 5" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label={t("startingDate")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.startDate}
                name="startDate"
                error={!!touched.startDate && !!errors.startDate}
                helperText={touched.startDate && errors.startDate}
                sx={{ gridColumn: "span 1" }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label={t("endingDate")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.endDate}
                name="endDate"
                error={!!touched.endDate && !!errors.endDate}
                helperText={touched.endDate && errors.endDate}
                sx={{ gridColumn: "span 1" }}
                InputLabelProps={{ shrink: true }}
              />
              <Button type="submit" color="secondary" variant="contained">
                {t("search")}
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {
        <Box mt="40px">
          <PettyCashForm handlePrint={handlePrint} />
        </Box>
      }

      <Box
        mt="40px"
        mb="40px"
        height="65vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: `1px solid ${colors.grey[200]}`,
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
          rows={searchStatus ? pettyCashSearchResults : pettyCash}
          columns={columns}
          getRowId={(row) => row._id}
          rowsPerPageOptions={[10, 25, 50]}
          editMode="cell"
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          isCellEditable={(params) => params.field !== "sequence"}
          experimentalFeatures={{ newEditingApi: true }}
        />
        {/* Summary Section */}
        <Box
          mt={4}
          p={3}
          bgcolor={colors.primary[400]}
          borderRadius="4px"
          display="grid"
          gap="30px"
          sx={{
            gridTemplateColumns: {
              xs: "1fr", // Single column on mobile
              sm: "repeat(2, 1fr)", // Two columns on tablet
              md: "repeat(3, 1fr)", // Three columns on desktop
            },
            "& > div": {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "20px",
              borderRadius: "8px",
            },
          }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              color={colors.grey[100]}
              mb={1}
              sx={{
                fontSize: { xs: "1rem", sm: "1.1rem" },
                fontWeight: "bold",
              }}
            >
              {t("totalSpends")}
            </Typography>
            <Typography
              variant="h4"
              color="secondary"
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              }}
            >
              <span>{totalSpends}</span>
              <span style={{ fontSize: "1em" }}> KD</span>
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              color={colors.grey[100]}
              mb={1}
              sx={{
                fontSize: { xs: "1rem", sm: "1.1rem" },
                fontWeight: "bold",
              }}
            >
              {t("totalAmountOnWorkers")}
            </Typography>
            <Typography
              variant="h4"
              color="secondary"
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              }}
            >
              <span>{totalAmountOnWorker}</span>
              <span style={{ fontSize: "1em" }}> KD</span>
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              color={colors.grey[100]}
              mb={1}
              sx={{
                fontSize: { xs: "1rem", sm: "1.1rem" },
                fontWeight: "bold",
              }}
            >
              {t("totalAmountOnCompany")}
            </Typography>
            <Typography
              variant="h4"
              color="secondary"
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              }}
            >
              <span>{totalAmountOnCompany}</span>
              <span style={{ fontSize: "1em" }}> KD</span>
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        display="grid"
        gap="30px"
        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        sx={{
          "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
        }}
      ></Box>
      <PrintableTable
        rows={pettyCash}
        columns={columns}
        ref={componentRef}
        orientation="portrait"
        page="pettyCash"
        summary={{
          totalAmountOnWorker,
          totalAmountOnCompany,
        }}
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t("confirmDeletePettyCashTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t("confirmDeletePettyCashMessage")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            {t("cancel")}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

function PettyCashForm({ isNonMobile, handlePrint }) {
  const drivers = useSelector((state) => state.drivers.drivers);
  const users = useSelector((state) => state.users.users);
  const spendTypes = useSelector((state) => state.spendType.spendTypes);
  const pettyCash = useSelector((state) => state.pettyCash.pettyCash);
  const filteredUsers = users.filter((user) => user.role !== "Admin");
  const dispatch = useDispatch();
  const { t } = useTranslation();

  async function handleFormSubmit(values, options) {
    try {
      dispatch(
        createPettyCash({
          values: {
            ...values,
            deductedFromUser: values.deductedFromUser || undefined,
            deductedFromDriver: values.deductedFromDriver || undefined,
          },
        })
      );

      options.resetForm();

      // TODO: Uncomment this later

      // dispatch(createNotification(buildNotificationAlert({
      //   driverId: values.selectedDriver,
      //   talabatDeductionAmount: values.talabatDeductionAmount,
      //   companyDeductionAmount: values.companyDeductionAmount,
      //   role: userInfo.role
      // })));
    } catch (error) {
      console.error("Row does not have a valid _id field:");
    }
  }

  return (
    <Formik
      initialValues={newPettyCashInitialValues}
      validationSchema={addNewPettyCashSchema}
      onSubmit={handleFormSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldValue,
      }) => (
        <form onSubmit={handleSubmit}>
          <Header title={t("addNewPettyCash")} />
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(6, minmax(0, 1fr))"
            sx={{
              "& > div": {
                gridColumn: isNonMobile ? undefined : "span 2",
              },
            }}
          >
            <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
              <InputLabel id="select-user-label">
                {t("requestApplicant")}
              </InputLabel>
              <Select
                labelId="select-user-label"
                id="select-user"
                value={values.requestApplicant}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.requestApplicant && !!errors.requestApplicant}
                name="requestApplicant"
                label="Select User"
              >
                {filteredUsers.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} - ({user.role})
                  </MenuItem>
                ))}
              </Select>
              {values.requestApplicant && (
                <IconButton
                  onClick={() => setFieldValue("requestApplicant", "")}
                  sx={{ gridColumn: "span 1" }}
                  style={{
                    display: "flex",
                    width: "30px",
                    height: "30px",
                  }}
                >
                  <ClearIcon />
                </IconButton>
              )}
            </FormControl>
            <TextField
              fullWidth
              variant="filled"
              type="number"
              label={t("serialNumber")}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.serialNumber}
              name="serialNumber"
              error={!!touched.serialNumber && !!errors.serialNumber}
              helperText={touched.serialNumber && errors.serialNumber}
              sx={{ gridColumn: "span 1" }}
            />
            <TextField
              fullWidth
              variant="filled"
              type="date"
              label={t("requestDate")}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.requestDate}
              name="requestDate"
              error={!!touched.requestDate && !!errors.requestDate}
              helperText={touched.requestDate && errors.requestDate}
              sx={{ gridColumn: "span 1" }}
            />
          </Box>
          <hr style={{ border: "1px solid #ee8020", margin: "40px 0" }} />
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(6, minmax(0, 1fr))"
            sx={{
              "& > div": { gridColumn: isNonMobile ? undefined : "span 2" },
            }}
          >
            <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
              <InputLabel id="deducted-from-label">
                {t("deductedFrom")}
              </InputLabel>
              <Select
                labelId="deducted-from-label"
                id="deducted-from"
                value={
                  values.deductedFromDriver
                    ? `driver:${values.deductedFromDriver}`
                    : values.deductedFromUser
                    ? `user:${values.deductedFromUser}`
                    : ""
                }
                onChange={(event) => {
                  const [type, id] = event.target.value.split(":");
                  setFieldValue(
                    "deductedFromDriver",
                    type === "driver" ? id : ""
                  );
                  setFieldValue("deductedFromUser", type === "user" ? id : "");
                }}
                onBlur={handleBlur}
                error={
                  (!!touched.deductedFromDriver &&
                    !!errors.deductedFromDriver) ||
                  (!!touched.deductedFromUser && !!errors.deductedFromUser)
                }
                label={t("deductedFrom")}
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
              {(values.deductedFromDriver || values.deductedFromUser) && (
                <IconButton
                  onClick={() => {
                    setFieldValue("deductedFromDriver", "");
                    setFieldValue("deductedFromUser", "");
                  }}
                  sx={{
                    position: "absolute",
                    right: 32,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <ClearIcon />
                </IconButton>
              )}
            </FormControl>
            <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
              <InputLabel id="select-user-label">
                {t("selectSpendType")}
              </InputLabel>
              <Select
                labelId="select-spendType-label"
                id="select-spendType"
                value={values.spendType}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.spendType && !!errors.spendType}
                name="spendType"
                label="Select spend type"
              >
                {spendTypes.map((spendType) => (
                  <MenuItem key={spendType._id} value={spendType._id}>
                    {spendType.name}
                  </MenuItem>
                ))}
              </Select>
              {values.selectedSpendType && (
                <IconButton
                  onClick={() => setFieldValue("selectedSpendType", "")}
                  sx={{ gridColumn: "span 1" }}
                  style={{
                    display: "flex",
                    width: "30px",
                    height: "30px",
                  }}
                >
                  <ClearIcon />
                </IconButton>
              )}
            </FormControl>

            <TextField
              fullWidth
              variant="filled"
              type="text"
              label={t("spendsReason")}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.spendsReason}
              name="spendsReason"
              error={!!touched.spendsReason && !!errors.spendsReason}
              helperText={touched.spendsReason && errors.spendsReason}
              sx={{ gridColumn: "span 1" }}
            />
            <TextField
              fullWidth
              variant="filled"
              type="number"
              label={t("cashAmount")}
              onBlur={handleBlur}
              onChange={handleChange}
              value={Number(values.cashAmount).toFixed(3)}
              name="cashAmount"
              error={!!touched.cashAmount && !!errors.cashAmount}
              helperText={touched.cashAmount && errors.cashAmount}
              sx={{ gridColumn: "span 1" }}
            />
            <TextField
              fullWidth
              variant="filled"
              type="text"
              label={t("spendsRemarks")}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.spendsRemarks}
              name="spendsRemarks"
              error={!!touched.spendsRemarks && !!errors.spendsRemarks}
              helperText={touched.spendsRemarks && errors.spendsRemarks}
              sx={{ gridColumn: "span 1" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="date"
              label={t("spendsDate")}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.spendsDate}
              name="spendsDate"
              error={!!touched.spendsDate && !!errors.spendsDate}
              helperText={touched.spendsDate && errors.spendsDate}
              sx={{ gridColumn: "span 1" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="number"
              label={t("startingBalance")}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.currentBalance}
              name="currentBalance"
              error={!!touched.currentBalance && !!errors.currentBalance}
              helperText={touched.currentBalance && errors.currentBalance}
              sx={{ gridColumn: "span 1" }}
            />
            <Box
              sx={{
                gridColumn: "span 1",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                sx={{ width: "120px", height: "50px" }}
              >
                {t("saveData")}
              </Button>
            </Box>

            <Box
              display="flex"
              sx={{ gridColumn: "span 2" }}
              gap="20px"
              justifyContent="flex-end"
            >
              <Button
                onClick={handlePrint}
                color="primary"
                variant="contained"
                sx={{ width: "120px", height: "50px" }}
              >
                {t("print")}
              </Button>
            </Box>
          </Box>
        </form>
      )}
    </Formik>
  );
}

export default PettyCash;
