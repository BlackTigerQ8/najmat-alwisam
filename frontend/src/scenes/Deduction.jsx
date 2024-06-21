import React, { useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  IconButton,
  Input,
  Typography,
  useTheme,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { ErrorMessage, Formik } from "formik";
import * as yup from "yup";
import { pulsar } from "ldrs";
import { tokens } from "../theme";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";
import { fetchDrivers } from "../redux/driversSlice";
import { fetchUsers } from "../redux/usersSlice";
import { useDispatch, useSelector } from "react-redux";
import { createDriverInvoice } from "../redux/invoiceSlice";
import { createUserInvoice } from "../redux/userSlice";
import {
  createNotification,
  buildNotificationAlert,
} from "../redux/notificationSlice";
import { useParams } from "react-router-dom";

const initialValues = {
  deductionReason: "",
  talabatDeductionAmount: "",
  companyDeductionAmount: "",
  selectedDriver: "",
  selectedUser: "",
  file: "",
  uploadedFile: null,
};

const userSchema = yup
  .object()
  .shape({
    deductionReason: yup.string().required("Required"),
    talabatDeductionAmount: yup.string(),
    companyDeductionAmount: yup.string(),
    selectedDriver: yup.string(),
    selectedUser: yup.string(),
    uploadedFile: yup
      .mixed()
      .required("Required")
      .test("fileType", "Only PDF files are allowed", (value) => {
        return value && value.type === "application/pdf";
      }),
  })
  .test({
    name: "selectedFieldsRequired",
    test: function (values) {
      const { selectedDriver, selectedUser } = values;
      if (!selectedDriver && !selectedUser) {
        throw this.createError({
          path: "selectedDriver",
          message: "Please select a driver or user",
        });
      }
      return true;
    },
  })
  .test({
    name: "atLeastOneFieldRequired",
    test: function (values) {
      const { talabatDeductionAmount, companyDeductionAmount } = values;
      if (!talabatDeductionAmount && !companyDeductionAmount) {
        throw this.createError({
          path: "talabatDeductionAmount",
          message:
            "Please fill at least one of Talabat Deduction Amount or Company Deduction Amount",
        });
      }
      return true;
    },
  });

const Deduction = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const drivers = useSelector((state) => state.drivers.drivers);
  const params = useParams();
  const driverInfo = drivers.find((d) => d._id === params.id);
  const users = useSelector((state) => state.users.users);
  const filteredUsers = users.filter((user) => user.role !== "Admin");
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");
  const status = useSelector((state) => state.drivers.status);
  const error = useSelector((state) => state.drivers.error);

  useEffect(() => {
    dispatch(fetchDrivers(token));
    dispatch(fetchUsers(token));
  }, [token]);

  async function handleFormSubmit(values) {
    try {
      if (values.selectedDriver) {
        dispatch(
          createDriverInvoice({
            values: {
              ...values,
              driverId: values.selectedDriver,
            },
          })
        );
      } else if (values.selectedUser) {
        dispatch(
          createUserInvoice({
            values: {
              ...values,
              driverId: values.selectedDriver,
            },
          })
        );
      }

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
        title="DEDUCT SALARY"
        subtitle="Deduct Salary from Employee/Driver"
      />
      <Formik
        initialValues={initialValues}
        validationSchema={userSchema}
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
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                <InputLabel id="select-driver-label">Select Driver</InputLabel>
                <Select
                  labelId="select-driver-label"
                  id="select-driver"
                  value={values.selectedDriver}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.selectedDriver && !!errors.selectedDriver}
                  name="selectedDriver"
                  label="Select Driver"
                  disabled={values.selectedUser}
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
                {values.selectedDriver && (
                  <IconButton
                    onClick={() => setFieldValue("selectedDriver", "")}
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
                <InputLabel id="select-user-label">Select User</InputLabel>
                <Select
                  labelId="select-user-label"
                  id="select-user"
                  value={values.selectedUser}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.selectedUser && !!errors.selectedUser}
                  name="selectedUser"
                  label="Select User"
                  disabled={values.selectedDriver}
                >
                  {filteredUsers.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} - ({user.role})
                    </MenuItem>
                  ))}
                </Select>
                {values.selectedUser && (
                  <IconButton
                    onClick={() => setFieldValue("selectedUser", "")}
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
                type=""
                label="Reason of deduction"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.deductionReason}
                name="deductionReason"
                error={!!touched.deductionReason && !!errors.deductionReason}
                helperText={touched.deductionReason && errors.deductionReason}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Talabat deduction amount (K.D.)"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.talabatDeductionAmount}
                name="talabatDeductionAmount"
                error={
                  !!touched.talabatDeductionAmount &&
                  !!errors.talabatDeductionAmount
                }
                helperText={
                  touched.talabatDeductionAmount &&
                  errors.talabatDeductionAmount
                }
                sx={{ gridColumn: "span 2" }}
                disabled={values.selectedUser}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Company deduction amount (K.D.)"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.companyDeductionAmount}
                name="companyDeductionAmount"
                error={
                  !!touched.companyDeductionAmount &&
                  !!errors.companyDeductionAmount
                }
                helperText={
                  touched.companyDeductionAmount &&
                  errors.companyDeductionAmount
                }
                sx={{ gridColumn: "span 2" }}
              />
              <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                <InputLabel shrink htmlFor="uploadedFile">
                  Upload File
                </InputLabel>
                <Input
                  id="uploadedFile"
                  type="file"
                  name="uploadedFile"
                  onBlur={handleBlur}
                  onChange={(event) => {
                    // Setting file to Formik state
                    setFieldValue("uploadedFile", event.currentTarget.files[0]);
                  }}
                  error={!!touched.uploadedFile && !!errors.uploadedFile}
                  helperText={touched.uploadedFile && errors.uploadedFile}
                />
                <ErrorMessage
                  name="uploadedFile"
                  render={(msg) => (
                    <Typography variant="caption" color="error">
                      {msg}
                    </Typography>
                  )}
                />
              </FormControl>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Submit
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Deduction;
