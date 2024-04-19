import React, { useEffect, useMemo } from "react";
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
} from "../redux/pettyCashSlice";
import { pulsar } from "ldrs";
import { fetchDrivers } from "../redux/driversSlice";
import { fetchUsers } from "../redux/usersSlice";
import { fetchAllSpendTypes } from "../redux/spendTypeSlice";

const initialValues = {
  serialNumber: "",
  requestApplicant: "",
  requestDate: "",
};

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
  serialNumber: yup.number(),
  requestApplicant: yup.string(),
  requestDate: yup.string(),
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
  const pettyCash = useSelector((state) => state.pettyCash.pettyCash);
  const pageStatus = useSelector((state) => state.pettyCash.status);
  const error = useSelector((state) => state.pettyCash.error);

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

  async function handleFormSubmit(values) {
    try {
      console.log("form values", values);

      dispatch(
        searchPettyCash({
          values,
        })
      );

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
    () => pettyCash.reduce((sum, pettyCash) => sum + pettyCash.cashAmount, 0),
    [pettyCash]
  );
  const totalAmountOnWorker = useMemo(
    () =>
      pettyCash.reduce(
        (sum, pettyCash) =>
          sum +
          (pettyCash.deductedFromDriver || pettyCash.deductedFromUser
            ? pettyCash.cashAmount
            : 0),
        0
      ),
    [pettyCash]
  );
  const totalAmountOnCompany = totalSpends - totalAmountOnWorker;

  useEffect(() => {
    dispatch(fetchDrivers(token));
    dispatch(fetchUsers(token));
    dispatch(fetchAllSpendTypes(token));
  }, [token]);

  const columns = [
    {
      field: "sequence",
      headerName: "NO.",
    },
    {
      field: "spendsDate",
      valueFormatter: (params) => {
        const date = new Date(params.value);
        const formattedDate = `${date.getDate()}/${
          date.getMonth() + 1
        }/${date.getFullYear()}`;
        return formattedDate;
      },
      headerName: "Spends Date",
      flex: 1,
    },
    {
      field: "spendsReason",
      headerName: "Spends Reason",
      flex: 1,
    },
    {
      field: "cashAmount",
      headerName: "Cash Amount",
      flex: 1,
    },
    {
      field: "spendType",
      headerName: "spendType",
      flex: 1,
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
      headerName: "Remarks",
      flex: 1,
    },
    {
      field: "deductedFrom",
      headerName: "Deducted From",
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
  ];

  useEffect(() => {
    dispatch(fetchPettyCash());
  }, [dispatch]);

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
      <Header title="PETTY CASH" subtitle="Petty Cash Page" />
      <Formik
        initialValues={initialValues}
        validationSchema={pettyCashRequestSchema}
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
                type="number"
                label="Serial Number"
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
                type="text"
                label="Request Applicant"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.requestApplicant}
                name="requestApplicant"
                error={!!touched.requestApplicant && !!errors.requestApplicant}
                helperText={touched.requestApplicant && errors.requestApplicant}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="Request Date"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.requestDate}
                name="requestDate"
                error={!!touched.requestDate && !!errors.requestDate}
                helperText={touched.requestDate && errors.requestDate}
                sx={{ gridColumn: "span 1" }}
              />
              <Button type="submit" color="secondary" variant="contained">
                Search
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {
        <Box mt="50px">
          <PettyCashForm />
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
          rows={searchStatus ? pettyCashSearchResults : pettyCash}
          columns={columns}
          getRowId={(row) => row._id}
        />
        <Box
          display="grid"
          gap="70px"
          gridTemplateColumns="repeat(3, minmax(0, 1fr))"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
          }}
        >
          <Typography variant="h4" color="secondary" mt={4}>
            Total spends:
            <strong>
              <span> {totalSpends} </span> KD
            </strong>
          </Typography>
          <Typography variant="h4" color="secondary" mt={4}>
            Total amount on workers:
            <strong>
              <span> {totalAmountOnWorker} </span> KD
            </strong>
          </Typography>
          <Typography variant="h4" color="secondary" mt={4}>
            Net amount on company:
            <strong>
              <span> {totalAmountOnCompany} </span> KD
            </strong>
          </Typography>
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
    </Box>
  );
};

function PettyCashForm({ isNonMobile }) {
  const drivers = useSelector((state) => state.drivers.drivers);
  const users = useSelector((state) => state.users.users);
  const spendTypes = useSelector((state) => state.spendType.spendTypes);
  const pettyCash = useSelector((state) => state.pettyCash.pettyCash);

  const dispatch = useDispatch();

  async function handleFormSubmit(values, options) {
    try {
      console.log("on submit", options.resetForm);
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
          <Header title="Add new petty cash" />
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            sx={{
              "& > div": { gridColumn: isNonMobile ? undefined : "span 2" },
            }}
          >
            <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
              <InputLabel id="select-user-label">Select User</InputLabel>
              <Select
                labelId="select-user-label"
                id="select-user"
                value={values.deductedFromUser}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.deductedFromUser && !!errors.deductedFromUser}
                name="deductedFromUser"
                label="Select User"
                disabled={!!values.deductedFromDriver}
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </MenuItem>
                ))}
              </Select>
              {values.deductedFromUser && (
                <IconButton
                  onClick={() => setFieldValue("deductedFromUser", "")}
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

            <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
              <InputLabel id="select-driver-label">Select Driver</InputLabel>
              <Select
                labelId="select-driver-label"
                id="select-driver"
                value={values.deductedFromDriver}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  !!touched.deductedFromDriver && !!errors.deductedFromDriver
                }
                name="deductedFromDriver"
                label="Select Driver"
                disabled={!!values.deductedFromUser}
                MenuProps={{
                  MenuListProps: { disablePadding: true },
                  PaperProps: {
                    style: {
                      maxHeight: 500,
                    },
                  },
                }}
              >
                {drivers.map((driver) => (
                  <MenuItem key={driver._id} value={driver._id}>
                    {driver.firstName} {driver.lastName}
                  </MenuItem>
                ))}
              </Select>
              {values.deductedFromDriver && (
                <IconButton
                  onClick={() => setFieldValue("deductedFromDriver", "")}
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

            <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
              <InputLabel id="select-user-label">Select spend type</InputLabel>
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
              type="number"
              label="Serial No."
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
              type="text"
              label="Spends reason"
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
              label="Cash amount"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.cashAmount}
              name="cashAmount"
              error={!!touched.cashAmount && !!errors.cashAmount}
              helperText={touched.cashAmount && errors.cashAmount}
              sx={{ gridColumn: "span 1" }}
            />
            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Spends remarks"
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
              type="text"
              label="Request Applicant"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.requestApplicant}
              name="requestApplicant"
              error={!!touched.requestApplicant && !!errors.requestApplicant}
              helperText={touched.requestApplicant && errors.requestApplicant}
              sx={{ gridColumn: "span 1" }}
            />
            <TextField
              fullWidth
              variant="filled"
              type="date"
              label="Resquest Date"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.requestDate}
              name="requestDate"
              error={!!touched.requestDate && !!errors.requestDate}
              helperText={touched.requestDate && errors.requestDate}
              sx={{ gridColumn: "span 1" }}
            />
            <TextField
              fullWidth
              variant="filled"
              type="date"
              label="Spends Date"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.spendsDate}
              name="spendsDate"
              error={!!touched.spendsDate && !!errors.spendsDate}
              helperText={touched.spendsDate && errors.spendsDate}
              sx={{ gridColumn: "span 1" }}
            />
            {!pettyCash.length && (
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Starting balance"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.currentBalance}
                name="currentBalance"
                error={!!touched.currentBalance && !!errors.currentBalance}
                helperText={touched.currentBalance && errors.currentBalance}
                sx={{ gridColumn: "span 1" }}
              />
            )}

            <Button type="submit" color="secondary" variant="contained">
              Save Data
            </Button>
          </Box>
        </form>
      )}
    </Formik>
  );
}

export default PettyCash;
