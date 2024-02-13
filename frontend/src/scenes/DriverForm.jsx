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
} from "@mui/material";

import { ErrorMessage, Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";
import { useDispatch } from "react-redux";
import { registerDriver } from "../redux/driversSlice";

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
  visa: yup.string().required("required"),
  contractExpiryDate: yup.string().required("required"),
  vehicle: yup.string().required("required"),
  carInsurance: yup.string().required("required"),
  carPlateNumber: yup.string().required("required"),
  driverLicense: yup.string().required("required"),
  workPass: yup.string().required("required"),
  contractType: yup.string().required("required"),
  healthInsuranceDate: yup.string().required("required"),
  healthInsuranceExpiryDate: yup.string().required("required"),
  iban: yup.string().required("required"),
  phoneSerialNumber: yup.string().required("required"),
  phoneContractNumber: yup.string().required("required"),
  referenceNumber: yup.number().required("required"),
  uploadedFile: yup
    .mixed()
    .test("fileType", "Only PDF files are allowed", (value) => {
      if (!value) return true;
      return value && value.type === "application/pdf";
    }),
});

const DriverForm = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();

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

  return (
    <Box m="20px">
      <Header title="ADD DRIVER" subtitle="Add a New Driver" />

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
                value={values.healthInsuranceDate}
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
                Add New Driver
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default DriverForm;
