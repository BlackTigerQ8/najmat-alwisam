import React from "react";
import {
  Box,
  Typography,
  Button,
  useTheme,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Input,
  FormHelperText,
} from "@mui/material";
import Header from "../components/Header";
import { tokens } from "../theme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSelector, useDispatch } from "react-redux";
import { pulsar } from "ldrs";
import { ErrorMessage, Formik } from "formik";
import { updateDriver } from "../redux/driversSlice";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { BANK_NAMES, DRIVER_POSITIONS } from "../utils/userConstants";

const DriverProfile = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const drivers = useSelector((state) => state.drivers.drivers ?? []);
  const params = useParams();
  const driverInfo = drivers.find((d) => d._id === params.id);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const status = useSelector((state) => state.drivers.status);
  const error = useSelector((state) => state.drivers.error);

  const initialValues = driverInfo || {
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
    carRegisteration: "",
    carRegisterationExpiryDate: "",
    driverLicense: "",
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

  const validationSchema = Yup.object().shape({
    uploadedFile: Yup.mixed().test(
      "fileType",
      "Only PDF files are allowed",
      (value) => {
        if (!value) return true;
        return value && value.type === "application/pdf";
      }
    ),
  });

  const handleFormSubmit = async (values) => {
    try {
      // await dispatch(updateDriver({ values, driverId: driverInfo._id }));

      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key !== "uploadedFile" && key !== "__v") {
          formData.append(key, values[key] || undefined);
        }
      });

      if (values.uploadedFile)
        formData.append("uploadedFile", values.uploadedFile);

      await dispatch(
        updateDriver({ values, driverId: driverInfo._id, formData })
      );
    } catch (error) {
      console.error("Error updating driver:", error.message);
    }
  };

  const handleViewFile = (values) => {
    if (values.uploadedFile || driverInfo.file) {
      const fileUrl = values.uploadedFile
        ? URL.createObjectURL(values.uploadedFile)
        : `${process.env.REACT_APP_API_URL}/${driverInfo.file}`;

      // Open the file in a new tab or window
      window.open(fileUrl, "_blank");
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
            onClick={() => navigate("/drivers")}
          >
            Back to Drivers page
          </Button>
        </Box>
      </div>
    );
  }

  return (
    <Box m="20px">
      <Header
        title="DRIVER PROFILE"
        subtitle="View/Update Driver Information"
      />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={validationSchema}
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
                value={
                  values.idExpiryDate
                    ? new Date(values.idExpiryDate).toISOString().split("T")[0]
                    : ""
                }
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
                value={
                  values.passportExpiryDate
                    ? new Date(values.passportExpiryDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
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
                // Convert the date string to a valid date string (YYYY-MM-DD)
                value={
                  values.contractExpiryDate
                    ? new Date(values.contractExpiryDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
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
                value={
                  values.driverLicenseExpiryDate
                    ? new Date(values.driverLicenseExpiryDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
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
                label={t("carRegisteration")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.carRegisteration}
                name="carRegisteration"
                error={!!touched.carRegisteration && !!errors.carRegisteration}
                helperText={touched.carRegisteration && errors.carRegisteration}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label={t("carRegisterationExpiryDate")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={
                  values.carRegisterationExpiryDate
                    ? new Date(values.carRegisterationExpiryDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
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
                value={
                  values.healthInsuranceExpiryDate
                    ? new Date(values.healthInsuranceExpiryDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
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
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel htmlFor="bankName">{t("bankName")}</InputLabel>
                <Select
                  label={t("bankName")}
                  value={values.bankName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="bankName"
                  error={!!touched.bankName && !!errors.bankName}
                >
                  {BANK_NAMES.map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {t(pos)}
                    </MenuItem>
                  ))}
                </Select>
                {touched.bankName && errors.bankName && (
                  <FormHelperText error>{errors.bankName}</FormHelperText>
                )}
              </FormControl>

              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel htmlFor="position">{t("position")}</InputLabel>
                <Select
                  label={t("position")}
                  value={values.position}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="position"
                  error={!!touched.position && !!errors.position}
                >
                  {DRIVER_POSITIONS.map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {t(pos)}
                    </MenuItem>
                  ))}
                </Select>
                {touched.position && errors.position && (
                  <FormHelperText error>{errors.position}</FormHelperText>
                )}
              </FormControl>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("iban")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.iban}
                name="iban"
                error={!!touched.iban && !!errors.iban}
                helperText={touched.iban && errors.iban}
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
                  <MenuItem value="Car">{t("car")}</MenuItem>
                  <MenuItem value="Bike">{t("bike")}</MenuItem>
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
                  <MenuItem value={"Talabat"}>{t("talabat")}</MenuItem>
                  <MenuItem value={"Others"}>{t("others")}</MenuItem>
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
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleViewFile(values)}
                  sx={{ gridColumn: "span 2", marginTop: "15px" }}
                  disabled={!values.uploadedFile && !driverInfo.file}
                >
                  {t("viewUploadedFile")}
                </Button>
              </FormControl>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                {t("update")}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default DriverProfile;
