import React, { useEffect, useState } from "react";
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
import { getUserRoleFromToken } from "./global/getUserRoleFromToken";
import { registerUser } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";

const initialValues = {
  firstName: "",
  lastName: "",
  email: undefined,
  phone: "",
  identification: "",
  passport: "",
  contractExpiryDate: "",
  role: "",
  uploadedFile: "",
  password: "",
  confirmPassword: "",
  mainSalary: "",
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

// const userSchema = yup.object().shape({
//   firstName: yup.string().required("required"),
//   lastName: yup.string().required("required"),
//   email: yup.string().email("Invalid email!"),
//   phone: yup
//     .string()
//     .matches(phoneRegExp, "Phone number is not valid!")
//     .required("required"),
//   identification: yup.string().required("required"),
//   passport: yup.string().required("required"),
//   contractExpiryDate: yup.string().required("required"),
//   role: yup.string().required("required"),
//   mainSalary: yup.number().required("required"),
//   password: yup
//     .string()
//     .min(6, "Password must be at least 6 characters")
//     .required("Password is required"),
//   confirmPassword: yup
//     .string()
//     .oneOf([yup.ref("password"), null], "Passwords must match")
//     .required("Confirm Password is required"),
//   uploadedFile: yup
//     .mixed()
//     .required("required")
//     .test("fileType", "Only PDF files are allowed", (value) => {
//       if (!value) return true;
//       return value && value.type === "application/pdf";
//     }),
// });

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.user);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const userRole =
    useSelector((state) => state.user.userRole) || getUserRoleFromToken();
  const savedToken = localStorage.getItem("token");

  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole", userRole);
    // const savedUser = JSON.parse(localStorage.getItem("userInfo"));
  }, []);

  const userSchema = yup.object().shape({
    firstName: yup.string().required(t("firstNameIsRequired")),
    lastName: yup.string().required(t("lastNameIsRequired")),
    email: yup.string().email(t("invalidEmail")).required(t("emailIsRequired")),
    phone: yup
      .string()
      .matches(phoneRegExp, t("invalidPhoneNumber"))
      .required(t("phoneIsRequired")),
    identification: yup.string().required(t("identificationIsRequired")),
    passport: yup.string().required(t("passportIsRequired")),
    contractExpiryDate: yup
      .string()
      .required(t("contractExpiryDateIsRequired")),
    role: yup.string().required(t("roleIsRequired")),
    mainSalary: yup.number().required(t("mainSalaryIsRequired")),
    password: yup
      .string()
      .min(6, t("passwordMinLength"))
      .required(t("passwordIsRequired")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], t("passwordsMustMatch"))
      .required(t("confirmPasswordIsRequired")),
    uploadedFile: yup
      .mixed()
      .required(t("fileIsRequired"))
      .test("fileType", t("onlyPDFAllowed"), (value) => {
        if (!value) return true;
        return value.type === "application/pdf";
      }),
  });

  const handleFormSubmit = async (values) => {
    try {
      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (key !== "uploadedFile") {
          formData.append(
            key,
            key === "email"
              ? values[key].toLowerCase()
              : values[key] || undefined
          );
        }
      });

      formData.append("uploadedFile", values.uploadedFile);

      await dispatch(registerUser(formData));
      navigate("/team");
    } catch (error) {
      console.error("Error registering user:", error.message);
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

  return (
    <Box m="20px">
      <Header title={t("createUserTitle")} subtitle={t("createUserSubtitle")} />

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
                label={t("email")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email ?? undefined}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
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
                type="text"
                label={t("idNumber")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.identification}
                name="identification"
                error={!!touched.identification && !!errors.identification}
                helperText={touched.identification && errors.identification}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("passport")}
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
              <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                <InputLabel shrink htmlFor="uploadedFile">
                  {t("uploadFile")}
                </InputLabel>
                <Input
                  id="uploadedFile"
                  type="file"
                  name={values.firstName + values.lastName}
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

              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel htmlFor="role">{t("role")}</InputLabel>
                <Select
                  label="Role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="role"
                  error={!!touched.role && !!errors.role}
                  helperText={touched.role && errors.role}
                >
                  <MenuItem value={"Accountant"}>{t("Accountant")}</MenuItem>
                  <MenuItem value={"Employee"}>{t("Employee")}</MenuItem>
                  {userRole === "Admin" && (
                    <MenuItem value={"Manager"}>{t("Manager")}</MenuItem>
                  )}
                  {userRole === "Admin" && (
                    <MenuItem value={"Admin"}>{t("Admin")}</MenuItem>
                  )}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label={t("password")}
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
                label={t("confirmPassword")}
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
                {t("createNewUser")}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Form;
