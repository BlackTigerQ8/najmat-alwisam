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
  setLockedValues,
  clearLockedValue,
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
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

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
  spendTypeSearch: "",
};

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
  const [isSearchActive, setIsSearchActive] = useState(false);
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

  const pettyCashRequestSchema = yup.object().shape({
    startDate: yup.string().required(t("startDateRequired")),
    endDate: yup
      .string()
      .required(t("endDateRequired"))
      .test("dates", t("endDateMustBeAfterStartDate"), function (endDate) {
        const { startDate } = this.parent;
        if (!startDate || !endDate) return true;
        return new Date(endDate) >= new Date(startDate);
      }),
  });

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Petty Cash Report",
  });

  async function handleFormSubmit(values) {
    try {
      dispatch(
        searchPettyCash({
          values: {
            startDate: values.startDate,
            endDate: values.endDate,
          },
        })
      );
      setSearchDates({
        startDate: values.startDate,
        endDate: values.endDate,
      });
      setIsSearchActive(true);

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

  const handleClearSearch = () => {
    setSearchDates({
      startDate: "",
      endDate: "",
    });
    setIsSearchActive(false);
    dispatch(fetchPettyCash());
  };

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
      flex: 0.2,
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
      flex: 0.8,
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
      flex: 0.5,
      editable: true,
      type: "number",
      valueFormatter: (params) => Number(params.value).toFixed(3),
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
      flex: 1.5,
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
      <Typography variant="h2" color="secondary" mb={2}>
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
              {isSearchActive && (
                <Button
                  type="button"
                  color="error"
                  variant="contained"
                  onClick={handleClearSearch}
                >
                  {t("clear")}
                </Button>
              )}
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
          totalSpends,
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
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="primary"
            variant="contained"
          >
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
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const drivers = useSelector((state) => state.drivers.drivers);
  const users = useSelector((state) => state.users.users);
  const spendTypes = useSelector((state) => state.spendType.spendTypes);
  const pettyCash = useSelector((state) => state.pettyCash.pettyCash);
  const filteredUsers = users.filter((user) => user.role !== "Admin");
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const lockedValues = useSelector((state) => state.pettyCash.lockedValues);
  const fieldsLocked = useSelector((state) => state.pettyCash.fieldsLocked);

  const initialFormValues = {
    ...newPettyCashInitialValues,
    requestApplicant: lockedValues.requestApplicant || "",
    serialNumber: lockedValues.serialNumber || "",
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      await dispatch(
        createPettyCash({
          values: {
            ...values,
            deductedFromUser: values.deductedFromUser || undefined,
            deductedFromDriver: values.deductedFromDriver || undefined,
          },
        })
      ).unwrap();

      // Save only requestApplicant and serialNumber to Redux
      dispatch(
        setLockedValues({
          requestApplicant: values.requestApplicant,
          serialNumber: values.serialNumber,
        })
      );

      // Reset form while keeping locked values
      resetForm({
        values: {
          ...newPettyCashInitialValues,
          requestApplicant: values.requestApplicant,
          serialNumber: values.serialNumber,
        },
      });

      // TODO: Uncomment this later

      // dispatch(createNotification(buildNotificationAlert({
      //   driverId: values.selectedDriver,
      //   talabatDeductionAmount: values.talabatDeductionAmount,
      //   companyDeductionAmount: values.companyDeductionAmount,
      //   role: userInfo.role
      // })));
      dispatch(fetchPettyCash());
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Add handler for unlocking fields
  const handleUnlock = (fieldName, setFieldValue) => {
    dispatch(clearLockedValue(fieldName));
    setFieldValue(fieldName, "");
  };

  const addNewPettyCashSchema = yup.object().shape({
    requestApplicant: yup.string().required(t("requestApplicantRequired")),
    serialNumber: yup.string().required(t("serialNumberRequired")),
    requestDate: yup.string().required(t("requestDateRequired")),
    spendsDate: yup.string().required(t("spendsDateRequired")),
    spendsReason: yup.string().required(t("spendsReasonRequired")),
    cashAmount: yup.string().required(t("cashAmountRequired")),
    spendType: yup.string().required(t("spendTypeRequired")),
    spendsRemarks: yup.string(),
    deductedFromUser: yup.string(),
    deductedFromDriver: yup.string(),
    currentBalance: yup.number(),
  });

  return (
    <Formik
      initialValues={{
        ...newPettyCashInitialValues,
        ...(fieldsLocked ? lockedValues : {}),
      }}
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
                disabled={fieldsLocked && lockedValues.requestApplicant}
              >
                {filteredUsers.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} - ({user.role})
                  </MenuItem>
                ))}
              </Select>
              {fieldsLocked && lockedValues.requestApplicant && (
                <IconButton
                  onClick={() =>
                    handleUnlock("requestApplicant", setFieldValue)
                  }
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
              disabled={fieldsLocked && lockedValues.serialNumber}
              InputProps={{
                endAdornment: fieldsLocked && lockedValues.serialNumber && (
                  <IconButton
                    onClick={() => handleUnlock("serialNumber", setFieldValue)}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                ),
              }}
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
              InputLabelProps={{ shrink: true }}
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
                onOpen={() => setFieldValue("spendTypeSearch", "")}
              >
                <ListSubheader
                  sx={{
                    bgcolor: "background.paper",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <Box
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <TextField
                      size="small"
                      autoFocus
                      placeholder={t("searchSpendTypes")}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFieldValue("spendTypeSearch", e.target.value);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                      }}
                      value={values.spendTypeSearch || ""}
                    />
                  </Box>
                </ListSubheader>
                {spendTypes
                  .filter(
                    (type) =>
                      !values.spendTypeSearch ||
                      type.name
                        .toLowerCase()
                        .includes(values.spendTypeSearch.toLowerCase())
                  )
                  .map((spendType) => (
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
                variant="contained"
                sx={{
                  width: "120px",
                  height: "50px",
                  backgroundColor: colors.blueAccent[600],
                  "&:hover": { backgroundColor: colors.blueAccent[500] },
                }}
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
