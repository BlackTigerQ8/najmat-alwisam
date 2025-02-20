import React, { useEffect, useState } from "react";
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
  Backdrop,
  Alert,
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
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const initialValues = {
  deductionReason: "",
  talabatDeductionAmount: "",
  companyDeductionAmount: "",
  selectedDriver: "",
  selectedUser: "",
  file: "",
  uploadedFile: null,
  deductionDate: null,
};

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
  const userInfo = useSelector((state) => state.user.userInfo);

  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");
  const status = useSelector((state) => state.drivers.status);
  const error = useSelector((state) => state.drivers.error);
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userSchema = yup
    .object()
    .shape({
      deductionReason: yup.string().required(t("deductionReasonRequired")),
      deductionDate: yup.date().required(t("deductionDateRequired")),
      talabatDeductionAmount: yup.string(),
      companyDeductionAmount: yup.string(),
      selectedDriver: yup.string(),
      selectedUser: yup.string(),
      uploadedFile: yup
        .mixed()
        .required(t("fileRequired"))
        .test("fileType", t("fileTypeMustBePdf"), (value) => {
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
            message: t("selectedFieldsRequired"),
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
            message: t("atLeastOneFieldRequired"),
          });
        }
        return true;
      },
    });

  useEffect(() => {
    dispatch(fetchDrivers(token));
    dispatch(fetchUsers(token));
  }, [token]);

  async function handleFormSubmit(values, { resetForm }) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("uploadedFile", values.uploadedFile);

      Object.keys(values).forEach((key) => {
        if (key !== "uploadedFile" && key !== "selectedDriver" && values[key]) {
          formData.append(key, values[key]);
        }
      });

      if (values.selectedDriver) {
        formData.append("driverId", values.selectedDriver);

        dispatch(createDriverInvoice(formData));
      } else if (values.selectedUser) {
        dispatch(createUserInvoice(formData));
      }

      resetForm({
        values: {
          ...initialValues,
          deductionDate: "",
        },
      });
    } catch (error) {
      console.error("Row does not have a valid _id field:");
    } finally {
      setIsSubmitting(false);
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
        <Alert severity="error">Error: {error}</Alert>
      </div>
    );
  }

  return (
    <>
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
      <Box m="20px">
        <Header title={t("deductionTitle")} subtitle={t("deductionSubtitle")} />
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
                <FormControl
                  fullWidth
                  sx={{
                    gridColumn:
                      userInfo.role !== "Admin" && userInfo.role !== "Manager"
                        ? "span 2"
                        : "span 2",
                  }}
                >
                  <InputLabel id="select-driver-label">
                    {t("selectDriver")}
                  </InputLabel>
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
                  <InputLabel id="select-user-label">
                    {t("selectUser")}
                  </InputLabel>
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
                </FormControl>

                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={t("reasonOfDeduction")}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.deductionReason}
                  name="deductionReason"
                  error={!!touched.deductionReason && !!errors.deductionReason}
                  helperText={touched.deductionReason && errors.deductionReason}
                  sx={{ gridColumn: "span 2" }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  type="date"
                  label={t("deductionDate")}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.deductionDate}
                  name="deductionDate"
                  error={!!touched.deductionDate && !!errors.deductionDate}
                  helperText={touched.deductionDate && errors.deductionDate}
                  sx={{ gridColumn: "span 2" }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  label={t("talabatDeductionAmountKD")}
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
                  label={t("companyDeductionAmountKD")}
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
                    {t("uploadFile")}
                  </InputLabel>
                  <Input
                    id="uploadedFile"
                    accept="application/pdf"
                    crossOrigin="anonymous"
                    type="file"
                    name="uploadedFile"
                    onBlur={handleBlur}
                    onChange={(event) => {
                      // Setting file to Formik state
                      setFieldValue(
                        "uploadedFile",
                        event.currentTarget.files[0]
                      );
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
                <Button
                  type="submit"
                  color="secondary"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {t("submit")}
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </>
  );
};

export default Deduction;
