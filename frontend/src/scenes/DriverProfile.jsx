import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import Header from "../components/Header";
import { tokens } from "../theme";
import { NewtonsCradle } from "@uiball/loaders";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSelector, useDispatch } from "react-redux";
import { pulsar } from "ldrs";
import { ErrorMessage, Formik } from "formik";
import { updateDriver } from "../redux/driversSlice";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";

const DriverProfile = ({ driverId }) => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const drivers = useSelector((state) => state.drivers.drivers ?? []);
  const params = useParams();
  const driverInfo = drivers.find((d) => d._id === params.id);
  const navigate = useNavigate();

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
    phoneSerialNumber: "",
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
      await dispatch(updateDriver({ values, driverId: driverInfo._id }));

      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key !== "uploadedFile" && key !== "__v" && key !== "mainSalary") {
          formData.append(key, values[key] || undefined);
        }
      });

      if (values.uploadedFile)
        formData.append("uploadedFile", values.uploadedFile);

      await dispatch(updateDriver({ driverId: driverInfo._id, formData }));
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
                label="First Name"
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
                label="Last Name"
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
                label="Email (optional)"
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
                label="Phone Number"
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
                label="ID Number"
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
                label="ID Expiry Date"
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
                label="Passport Number"
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
                label="Passport Expiry Date"
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
                label="Contract Expiry Date"
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
                label="Driver License Expiry Date"
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
                label="Car Plate Number"
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
                label="Car Registeration"
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
                label="Car Registeration Expiry Date"
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
                label="Work Pass"
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
                label="Gas Card Number"
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
                label="Health Insurance Expiry Date"
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
                label="Phone Serial Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phoneSerialNumber}
                name="phoneSerialNumber"
                error={
                  !!touched.phoneSerialNumber && !!errors.phoneSerialNumber
                }
                helperText={
                  touched.phoneSerialNumber && errors.phoneSerialNumber
                }
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Phone Contract Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phoneContractNumber}
                name="phoneContractNumber"
                error={
                  !!touched.phoneContractNumber && !!errors.phoneContractNumber
                }
                helperText={
                  touched.phoneContractNumber && errors.phoneContractNumber
                }
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="IBAN"
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
                <InputLabel htmlFor="vehicle">Vehicle</InputLabel>
                <Select
                  label="Vehicle"
                  value={values.vehicle}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="vehicle"
                  error={!!touched.vehicle && !!errors.vehicle}
                  helperText={touched.vehicle && errors.vehicle}
                >
                  <MenuItem value={"Car"}>Car</MenuItem>
                  <MenuItem value={"Bike"}>Bike</MenuItem>
                </Select>
              </FormControl>
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel htmlFor="contractType">Contract Type</InputLabel>
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
                label="Talabat ID"
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
                label="Main Salary"
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
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleViewFile(values)}
                  sx={{ gridColumn: "span 2", marginTop: "15px" }}
                  disabled={!values.uploadedFile && !driverInfo.file}
                >
                  View Uploaded File
                </Button>
              </FormControl>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Update
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default DriverProfile;
