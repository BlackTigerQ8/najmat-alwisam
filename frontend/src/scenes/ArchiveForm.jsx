import React, { useEffect } from "react";
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
import { addArchive } from "../redux/archiveSlice";

const initialValues = {
  fullName: "",
  company: "",
  idNumber: "",
  vehicle: "",
  workNumber: "",
  archiveNumber: "",
  uploadedFile: "",
};

const ArchiveForm = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, message, error } = useSelector((state) => state.archive);
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
    fullName: yup.string().required(t("fullNameIsRequired")),
    company: yup.number().required(t("companyIsRequired")),
    idNumber: yup.string().required(t("idNumberIsRequired")),
    vehicle: yup.string().required(t("vehicleIsRequired")),
    workNumber: yup.string().required(t("workNumberIsRequired")),
    archiveNumber: yup.string().required(t("archiveNumberIsRequired")),
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
        formData.append(key, values[key]);
      });
      await dispatch(addArchive(formData));
      navigate("/team");
    } catch (error) {
      console.error("Error adding archive:", error.message);
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
      <Header
        title={t("archiveFormTitle")}
        subtitle={t("archiveFormSubtitle")}
      />

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
                label={t("fullName")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.fullName}
                name="fullName"
                error={!!touched.fullName && !!errors.fullName}
                helperText={touched.fullName && errors.fullName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("company")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.company}
                name="company"
                error={!!touched.company && !!errors.company}
                helperText={touched.company && errors.company}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("idNumber")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.idNumber ?? undefined}
                name="idNumber"
                error={!!touched.idNumber && !!errors.idNumber}
                helperText={touched.idNumber && errors.idNumber}
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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("workNumber")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.workNumber}
                name="workNumber"
                error={!!touched.workNumber && !!errors.workNumber}
                helperText={touched.workNumber && errors.workNumber}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("archiveNumber")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.archiveNumber}
                name="archiveNumber"
                error={!!touched.archiveNumber && !!errors.archiveNumber}
                helperText={touched.archiveNumber && errors.archiveNumber}
                sx={{ gridColumn: "span 2" }}
              />

              <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                <InputLabel shrink htmlFor="uploadedFile">
                  {t("uploadFile")}
                </InputLabel>
                <Input
                  id="uploadedFile"
                  type="file"
                  name={values.fullName}
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
                {t("addToArchive")}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default ArchiveForm;
