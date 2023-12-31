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
} from "@mui/material";

import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  contact: "",
  idNumber: "",
  passport: "",
  visa: "",
  contract: "",
  role: "",
  uploadedFile: null,
  password: "",
  confirmPassword: "",
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const userSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("Invalid email!"),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid!")
    .required("required"),
  idNumber: yup.string().required("required"),
  passport: yup.string().required("required"),
  visa: yup.string().required("required"),
  contract: yup.string().required("required"),
  role: yup.string().required("required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");

  const handleFormSubmit = (values) => {
    console.log(values);
  };

  return (
    <Box m="20px">
      <Header title="CREATE USER" subtitle="Create a New User Profile" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={userSchema}
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
                label="Contact Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contact}
                name="contact"
                error={!!touched.contact && !!errors.contact}
                helperText={touched.contact && errors.contact}
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
                type="text"
                label="Passport Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.passport}
                name="passport"
                error={!!touched.passport && !!errors.passport}
                helperText={touched.passport && errors.passport}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Passport Number"
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
                type="text"
                label="Constact"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contract}
                name="contract"
                error={!!touched.contract && !!errors.contract}
                helperText={touched.contract && errors.contract}
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
              </FormControl>

              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel htmlFor="role">Role</InputLabel>
                <Select
                  label="Role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="role"
                  error={!!touched.role && !!errors.role}
                  helperText={touched.role && errors.role}
                >
                  <MenuItem value={"Admin"}>Admin</MenuItem>
                  <MenuItem value={"Accountant"}>Accountant</MenuItem>
                  <MenuItem value={"Employee"}>Employee</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Confirm Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.confirmPassword}
                name="confirmPassword"
                error={!!touched.confirmPassword && !!errors.confirmPassword}
                helperText={touched.confirmPassword && errors.confirmPassword}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New User
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Form;
