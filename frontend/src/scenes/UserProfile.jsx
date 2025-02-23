import React, { useEffect } from "react";
import {
  Box,
  Button,
  useTheme,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Input,
  Typography,
  Tooltip,
  FormHelperText,
} from "@mui/material";
import Header from "../components/Header";
import { tokens } from "../theme";
// import { NewtonsCradle } from "@uiball/loaders";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSelector, useDispatch } from "react-redux";
// import { trefoil } from "ldrs";
import { pulsar } from "ldrs";
import { ErrorMessage, Formik } from "formik";
import { fetchUsers, updateUser } from "../redux/usersSlice";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { BANK_NAMES, USER_POSITIONS, USER_ROLES } from "../utils/userConstants";
import { getUserRoleFromToken } from "./global/getUserRoleFromToken";

const UserProfile = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const users = useSelector((state) => state.users.users ?? []);
  const params = useParams();
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");
  const userInfo = users.find((d) => d._id === params.id);
  const userRole = userInfo?.role;
  const loggedInUserRole =
    useSelector((state) => state.user.userRole) || getUserRoleFromToken();
  const canEdit =
    loggedInUserRole === "Admin" || loggedInUserRole === "Manager";

  const status = useSelector((state) => state.users.status);
  const error = useSelector((state) => state.users.error);

  const initialValues = userInfo || {
    sequenceNumber: null,
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    identification: "",
    contractExpiryDate: "",
    iban: "",
    position: "",
    bankName: "",
    role: "",
    passport: "",
    password: "",
    createdAt: new Date(),
    file: "",
    mainSalary: 0,
  };

  useEffect(() => {
    dispatch(fetchUsers(token));
  }, [token]);

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

  const handleFormSubmit = async (values) => {
    try {
      if (userInfo && userInfo._id) {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (
            key !== "uploadedFile" &&
            key !== "__v" &&
            key !== "password" &&
            key !== "mainSalary"
          ) {
            formData.append(key, values[key] || undefined);
          }
        });

        if (values.password !== userInfo.password) {
          formData.append("password", values.password || undefined);
        }

        if (values.uploadedFile)
          formData.append("uploadedFile", values.uploadedFile);

        formData.set("email", values.email.toLowerCase());
        formData.append("mainSalary", values.mainSalary);

        await dispatch(updateUser({ userId: userInfo._id, formData }));
      } else {
        console.error("User information is undefined or does not have _id");
      }
    } catch (error) {
      console.error("Error updating user:", error.message);
    }
  };

  const handleViewFile = (values) => {
    if (values.uploadedFile || userInfo.file) {
      const fileUrl = values.uploadedFile
        ? URL.createObjectURL(values.uploadedFile)
        : `${process.env.REACT_APP_API_URL}/${userInfo.file}`;

      // Open the file in a new tab or window
      window.open(fileUrl, "_blank");
    }
  };

  const renderField = (textField) => {
    if (!canEdit) {
      return (
        <Tooltip title={t("noEditPermission")} placement="top">
          <Box sx={{ gridColumn: "span 2" }}>{textField}</Box>
        </Tooltip>
      );
    }
    return textField;
  };

  return (
    <Box m="20px">
      <Header
        title={t("userProfileTitle")}
        subtitle={t("userProfileSubtitle")}
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
                label="Sequence Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.sequenceNumber}
                name="Sequence Number"
                disabled
                error={!!touched.sequenceNumber && !!errors.sequenceNumber}
                helperText={touched.sequenceNumber && errors.sequenceNumber}
                sx={{ gridColumn: "span 2" }}
              />
              {renderField(
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={t("firstName")}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.firstName}
                  name="firstName"
                  disabled={!canEdit}
                  error={!!touched.firstName && !!errors.firstName}
                  helperText={touched.firstName && errors.firstName}
                  sx={{ gridColumn: "span 2" }}
                />
              )}
              {renderField(
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={t("lastName")}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.lastName}
                  name="lastName"
                  disabled={!canEdit}
                  error={!!touched.lastName && !!errors.lastName}
                  helperText={touched.lastName && errors.lastName}
                  sx={{ gridColumn: "span 2" }}
                />
              )}

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("email")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                // disabled={!canEdit}
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 2" }}
              />

              {renderField(
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={t("phone")}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.phone}
                  name="phone"
                  disabled={!canEdit}
                  error={!!touched.phone && !!errors.phone}
                  helperText={touched.phone && errors.phone}
                  sx={{ gridColumn: "span 2" }}
                />
              )}
              {renderField(
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={t("idNumber")}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.identification}
                  name="identification"
                  disabled={!canEdit}
                  error={!!touched.identification && !!errors.identification}
                  helperText={touched.identification && errors.identification}
                  sx={{ gridColumn: "span 2" }}
                />
              )}
              {renderField(
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
                  disabled={!canEdit}
                  error={
                    !!touched.contractExpiryDate && !!errors.contractExpiryDate
                  }
                  helperText={
                    touched.contractExpiryDate && errors.contractExpiryDate
                  }
                  sx={{ gridColumn: "span 2" }}
                />
              )}

              {renderField(
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={t("passport")}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.passport}
                  name="passport"
                  disabled={!canEdit}
                  error={!!touched.passport && !!errors.passport}
                  helperText={touched.passport && errors.passport}
                  sx={{ gridColumn: "span 2" }}
                />
              )}
              {renderField(
                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  label={t("mainSalary")}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.mainSalary}
                  name="mainSalary"
                  disabled={!canEdit}
                  error={!!touched.mainSalary && !!errors.mainSalary}
                  helperText={touched.mainSalary && errors.mainSalary}
                  sx={{ gridColumn: "span 2" }}
                />
              )}
              {renderField(
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={t("iban")}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.iban}
                  name="iban"
                  disabled={!canEdit}
                  error={!!touched.iban && !!errors.iban}
                  helperText={touched.iban && errors.iban}
                  sx={{ gridColumn: "span 2" }}
                />
              )}
              {renderField(
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
                    disabled={!canEdit}
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
              )}
              {renderField(
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
                    disabled={!canEdit}
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
              )}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("password")}
                onBlur={handleBlur}
                onChange={handleChange}
                name="password"
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Created at"
                onBlur={handleBlur}
                onChange={handleChange}
                value={
                  values.createdAt
                    ? new Date(values.createdAt).toISOString().split("T")[0]
                    : ""
                }
                name="createdAt"
                disabled
                error={!!touched.createdAt && !!errors.createdAt}
                helperText={touched.createdAt && errors.createdAt}
                sx={{ gridColumn: "span 2" }}
              />

              {renderField(
                <FormControl
                  fullWidth
                  variant="filled"
                  sx={{ gridColumn: "span 2" }}
                >
                  <InputLabel htmlFor="role">{t("role")}</InputLabel>
                  <Select
                    label="role"
                    value={values.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="role"
                    disabled={!canEdit}
                    error={!!touched.role && !!errors.role}
                    helperText={touched.role && errors.role}
                  >
                    {/* <MenuItem value={"Admin"}>Admin</MenuItem> */}
                    <MenuItem value={"Manager"}>{t("Manager")}</MenuItem>
                    <MenuItem value={"Accountant"}>{t("Accountant")}</MenuItem>
                    <MenuItem value={"Employee"}>{t("Employee")}</MenuItem>
                  </Select>
                </FormControl>
              )}

              {renderField(
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
                      setFieldValue(
                        "uploadedFile",
                        event.currentTarget.files[0]
                      );
                    }}
                    error={!!touched.uploadedFile && !!errors.uploadedFile}
                    helperText={touched.uploadedFile && errors.uploadedFile}
                    disabled={!canEdit}
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
                    disabled={!values.file && !userInfo?.file}
                  >
                    {t("viewUploadedFile")}
                  </Button>
                </FormControl>
              )}
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

export default UserProfile;
