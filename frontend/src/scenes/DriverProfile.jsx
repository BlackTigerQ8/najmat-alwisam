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
import { Formik } from "formik";
import { updateDriver } from "../redux/driversSlice";
import { useParams } from "react-router-dom";

const DriverProfile = ({ driverId }) => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const drivers = useSelector((state) => state.drivers.drivers ?? []);
  const params = useParams();
  const driverInfo = drivers.find((d) => d._id === params.id);

  const status = useSelector((state) => state.drivers.status);
  const error = useSelector((state) => state.drivers.error);

  const initialValues = driverInfo || {
    firstName: "",
    lastName: "",
    email: undefined,
    phone: "",
    idNumber: "",
    idExpiryDate: "",
    passportNumber: "",
    passportExpiryDate: "",
    visa: "",
    contractExpiryDate: "",
    carInsurance: "",
    carPlateNumber: "",
    driverLicense: "",
    workPass: "",
    healthInsuranceDate: "",
    healthInsuranceExpiryDate: "",
    phoneSerialNumber: "",
    iban: "",
    vehicle: "",
    contractType: "",
    referenceNumber: "",
    file: "",
  };

  pulsar.register();
  if (status === "loading") {
    return (
      <l-trefoil
        size="40"
        stroke="4"
        stroke-length="0.15"
        bg-opacity="0.1"
        speed="1.4"
        color="black"
      ></l-trefoil>
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

  return (
    <Box m="20px">
      <Header
        title="DRIVER PROFILE"
        subtitle="View/Update Driver Information"
      />
      <Formik onSubmit={handleFormSubmit} initialValues={initialValues}>
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
                type="text"
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
                type="text"
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
                type="text"
                label="VISA Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.visa}
                name="visa"
                error={!!touched.visa && !!errors.visa}
                helperText={touched.visa && errors.visa}
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
                type="text"
                label="Car Insurance"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.carInsurance}
                name="carInsurance"
                error={!!touched.carInsurance && !!errors.carInsurance}
                helperText={touched.carInsurance && errors.carInsurance}
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
                label="Driver License"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.driverLicense}
                name="driverLicense"
                error={!!touched.driverLicense && !!errors.driverLicense}
                helperText={touched.driverLicense && errors.driverLicense}
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
                type="date"
                label="Health Insurance Date"
                onBlur={handleBlur}
                onChange={handleChange}
                value={
                  values.healthInsuranceDate
                    ? new Date(values.healthInsuranceDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                name="healthInsuranceDate"
                error={
                  !!touched.healthInsuranceDate && !!errors.healthInsuranceDate
                }
                helperText={
                  touched.healthInsuranceDate && errors.healthInsuranceDate
                }
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
                label="Reference Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.referenceNumber}
                name="referenceNumber"
                error={!!touched.referenceNumber && !!errors.referenceNumber}
                helperText={touched.referenceNumber && errors.referenceNumber}
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
