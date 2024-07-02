import React from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Input,
  Typography,
  useTheme,
} from "@mui/material";

import { ErrorMessage, Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { registerDriver } from "../redux/driversSlice";
import { tokens } from "../theme";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";

const formatDate = (date) => {
  const formattedDate = new Date(date);
  const year = formattedDate.getFullYear();
  const month = String(formattedDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(formattedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: 0,
  idNumber: 0,
  idExpiryDate: "",
  passportNumber: "",
  passportExpiryDate: "",
  contractExpiryDate: "",
  driverLicenseExpiryDate: "",
  carPlateNumber: "",
  carRegisterationExpiryDate: "",
  workPass: "",
  gasCard: 0,
  healthInsuranceExpiryDate: "",
  carType: "",
  iban: "",
  vehicle: "",
  contractType: "",
  talabatId: "",
  mainSalary: 0,
  file: "",
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const driverSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("Invalid email!"),
  phone: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid!")
    .required("required"),
  idNumber: yup.number().required("required"),
  idExpiryDate: yup.string().required("required"),
  passportNumber: yup.string().required("required"),
  passportExpiryDate: yup.string().required("required"),
  contractExpiryDate: yup.string().required("required"),
  vehicle: yup.string().required("required"),
  driverLicenseExpiryDate: yup.string().required("required"),
  carPlateNumber: yup.string().required("required"),
  carRegisterationExpiryDate: yup.string().required("required"),
  workPass: yup.string(),
  contractType: yup.string().required("required"),
  talabatId: yup.string().required("required"),
  mainSalary: yup.number().required("required"),
  gasCard: yup.number().required("required"),
  healthInsuranceExpiryDate: yup.string().required("required"),
  iban: yup.string().required("required"),
  carType: yup.string(),
  employeeCompanyNumber: yup.string().required("required"),
  uploadedFile: yup
    .mixed()
    .required("required")
    .test("fileType", "Only PDF files are allowed", (value) => {
      if (!value) return true;
      return value && value.type === "application/pdf";
    }),
});

const DriverForm = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.user);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();

  const handleSubmit = async (values) => {
    const formData = new FormData();
    try {
      Object.keys(values).forEach((key) => {
        if (key !== "uploadedFile" && values[key]) {
          formData.append(key, values[key]);
        }
      });

      formData.append("uploadedFile", values.uploadedFile);

      await dispatch(registerDriver(formData));
    } catch (error) {
      console.error("Error registering driver:", error.message);
    }
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
      <Header title={t("driverFormTitle")} subtitle={t("driverFormSubtitle")} />

      <Formik
        onSubmit={handleSubmit}
        initialValues={initialValues}
        validationSchema={driverSchema}
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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("firstName")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("lastName")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("optionalEmail")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("phone")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phone}
                name="phone"
                error={!!touched.phone && !!errors.phone}
                helperText={touched.phone && errors.phone}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("idNumber")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.idNumber}
                name="idNumber"
                error={!!touched.idNumber && !!errors.idNumber}
                helperText={touched.idNumber && errors.idNumber}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label={t("idExpiryDate")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={formatDate(values.idExpiryDate)}
                name="idExpiryDate"
                error={!!touched.idExpiryDate && !!errors.idExpiryDate}
                helperText={touched.idExpiryDate && errors.idExpiryDate}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("passport")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.passportNumber}
                name="passportNumber"
                error={!!touched.passportNumber && !!errors.passportNumber}
                helperText={touched.passportNumber && errors.passportNumber}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label={t("passportExpiryDate")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.passportExpiryDate}
                name="passportExpiryDate"
                error={
                  !!touched.passportExpiryDate && !!errors.passportExpiryDate
                }
                helperText={
                  touched.passportExpiryDate && errors.passportExpiryDate
                }
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label={t("contractExpiryDate")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contractExpiryDate}
                name="contractExpiryDate"
                error={
                  !!touched.contractExpiryDate && !!errors.contractExpiryDate
                }
                helperText={
                  touched.contractExpiryDate && errors.contractExpiryDate
                }
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label={t("driverLicenseExpiryDate")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.driverLicenseExpiryDate}
                name="driverLicenseExpiryDate"
                error={
                  !!touched.driverLicenseExpiryDate &&
                  !!errors.driverLicenseExpiryDate
                }
                helperText={
                  touched.driverLicenseExpiryDate &&
                  errors.driverLicenseExpiryDate
                }
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label={t("carRegisterationExpiryDate")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.carRegisterationExpiryDate}
                name="carRegisterationExpiryDate"
                error={
                  !!touched.carRegisterationExpiryDate &&
                  !!errors.carRegisterationExpiryDate
                }
                helperText={
                  touched.carRegisterationExpiryDate &&
                  errors.carRegisterationExpiryDate
                }
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("carPlateNumber")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.carPlateNumber}
                name="carPlateNumber"
                error={!!touched.carPlateNumber && !!errors.carPlateNumber}
                helperText={touched.carPlateNumber && errors.carPlateNumber}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("workPass")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.workPass}
                name="workPass"
                error={!!touched.workPass && !!errors.workPass}
                helperText={touched.workPass && errors.workPass}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("gasCard")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.gasCard}
                name="gasCard"
                error={!!touched.gasCard && !!errors.gasCard}
                helperText={touched.gasCard && errors.gasCard}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label={t("healthInsuranceExpiryDate")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.healthInsuranceExpiryDate}
                name="healthInsuranceExpiryDate"
                error={
                  !!touched.healthInsuranceExpiryDate &&
                  !!errors.healthInsuranceExpiryDate
                }
                helperText={
                  touched.healthInsuranceExpiryDate &&
                  errors.healthInsuranceExpiryDate
                }
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("carType")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.carType}
                name="carType"
                error={!!touched.carType && !!errors.carType}
                helperText={touched.carType && errors.carType}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("employeeCompanyNumber")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.employeeCompanyNumber}
                name="employeeCompanyNumber"
                error={
                  !!touched.employeeCompanyNumber &&
                  !!errors.employeeCompanyNumber
                }
                helperText={
                  touched.employeeCompanyNumber && errors.employeeCompanyNumber
                }
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("IBAN")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.iban}
                name="iban"
                error={!!touched.iban && !!errors.iban}
                helperText={touched.iban && errors.iban}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("mainSalary")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.mainSalary}
                name="mainSalary"
                error={!!touched.mainSalary && !!errors.mainSalary}
                helperText={touched.mainSalary && errors.mainSalary}
                sx={{ gridColumn: "span 2" }}
              />
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel htmlFor="vehicle">{t("vehicle")}</InputLabel>
                <Select
                  label="Vehicle"
                  value={values.vehicle}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="vehicle"
                  error={!!touched.vehicle && !!errors.vehicle}
                  helperText={touched.vehicle && errors.vehicle}
                >
                  <MenuItem value={"Car"}>{t("car")}</MenuItem>
                  <MenuItem value={"Bike"}>{t("bike")}</MenuItem>
                </Select>
              </FormControl>
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel htmlFor="contractType">
                  {t("contractType")}
                </InputLabel>
                <Select
                  label="contractType"
                  value={values.contractType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="contractType"
                  error={!!touched.contractType && !!errors.contractType}
                  helperText={touched.contractType && errors.contractType}
                >
                  <MenuItem value={"Talabat"}>Talabat</MenuItem>
                  <MenuItem value={"Others"}>Others</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("talabatId")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.talabatId}
                name="talabatId"
                error={!!touched.talabatId && !!errors.talabatId}
                helperText={touched.talabatId && errors.talabatId}
                sx={{ gridColumn: "span 2" }}
              />
              <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                <InputLabel shrink htmlFor="uploadedFile">
                  {t("uploadFile")}
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
                {t("addNewDriver")}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default DriverForm;
