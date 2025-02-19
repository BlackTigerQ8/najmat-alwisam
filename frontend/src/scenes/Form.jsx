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
  Backdrop,
  FormHelperText,
} from "@mui/material";

import { ErrorMessage, Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";
import { getUserRoleFromToken } from "./global/getUserRoleFromToken";
import { registerUser } from "../redux/userSlice";
import {
  checkPhoneExists,
  checkEmailExists,
  checkIdentificationExists,
  checkPassportExists,
} from "../redux/usersSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";
import { USER_POSITIONS, USER_ROLES } from "../utils/userConstants";

const initialValues = {
  firstName: "",
  lastName: "",
  email: undefined,
  phone: "",
  identification: "",
  passport: "",
  contractExpiryDate: "",
  iban: "",
  bankName: "",
  position: "",
  role: "",
  uploadedFile: "",
  password: "",
  confirmPassword: "",
  mainSalary: "",
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole", userRole);
    // const savedUser = JSON.parse(localStorage.getItem("userInfo"));
  }, []);

  // const phoneRegExp =
  //   /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

  const validationSchema = yup.object().shape({
    firstName: yup.string().required(t("required")),
    lastName: yup.string().required(t("required")),
    phone: yup
      .number()
      .required(t("required"))
      .test("unique", t("phoneAlreadyExists"), async function (value) {
        if (!value) return true;
        const result = await dispatch(checkPhoneExists(value));
        return !result.payload;
      }),
    email: yup
      .string()
      .email(t("invalidEmail"))
      .required(t("required"))
      .test("unique", t("emailAlreadyExists"), async function (value) {
        if (!value) return true;
        const result = await dispatch(checkEmailExists(value));
        return !result.payload;
      }),
    identification: yup
      .number()
      .required(t("required"))
      .test("unique", t("identificationAlreadyExists"), async function (value) {
        if (!value) return true;
        const result = await dispatch(checkIdentificationExists(value));
        return !result.payload;
      }),
    passport: yup
      .string()
      .required(t("required"))
      .test("unique", t("passportAlreadyExists"), async function (value) {
        if (!value) return true;
        const result = await dispatch(checkPassportExists(value));
        return !result.payload;
      }),
    role: yup
      .string()
      .oneOf(USER_ROLES, t("invalidRole"))
      .required(t("roleRequired")),
    mainSalary: yup.number().required(t("required")),
    contractExpiryDate: yup.date().required(t("required")),
    iban: yup.string().required(t("required")),
    bankName: yup.string().required(t("required")),
    position: yup
      .string()
      .oneOf(USER_POSITIONS, t("invalidPosition"))
      .required(t("positionRequired")),
    password: yup
      .string()
      .required(t("required"))
      .min(6, t("passwordMinLength")),
    confirmPassword: yup
      .string()
      .required(t("required"))
      .oneOf([yup.ref("password")], t("passwordsNotMatch")),
  });

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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
      <Header title={t("createUserTitle")} subtitle={t("createUserSubtitle")} />

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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("bankName")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.bankName}
                name="bankName"
                error={!!touched.bankName && !!errors.bankName}
                helperText={touched.bankName && errors.bankName}
                sx={{ gridColumn: "span 2" }}
              />
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
                  {USER_POSITIONS.map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {t(pos)}
                    </MenuItem>
                  ))}
                </Select>
                {touched.position && errors.position && (
                  <FormHelperText error>{errors.position}</FormHelperText>
                )}
              </FormControl>

              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel htmlFor="role">{t("role")}</InputLabel>
                <Select
                  label={t("role")}
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
