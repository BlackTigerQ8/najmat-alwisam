import React, { useState, useEffect } from "react";
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
  ListSubheader,
} from "@mui/material";

import { ErrorMessage, Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";
import { addArchive } from "../redux/archiveSlice";
import { fetchUsers } from "../redux/usersSlice";
import { fetchDrivers } from "../redux/driversSlice";

const ArchiveForm = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, message, error } = useSelector((state) => state.archive);
  const { users } = useSelector((state) => state.users);
  const { drivers } = useSelector((state) => state.drivers);
  const token = localStorage.getItem("token");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const initialValues = {
    fullName: "",
    company: "",
    idNumber: "",
    vehicle: "",
    workNumber: "",
    archiveNumber: "",
    uploadedFile: "",
  };

  const userSchema = yup.object().shape({
    fullName: yup.string().required(t("fullNameIsRequired")),
    company: yup.string().required(t("companyIsRequired")),
    idNumber: yup.string().required(t("idNumberIsRequired")),
    vehicle: yup.string().when("selectedValue", {
      is: (value) => value?.startsWith("driver:"),
      then: () => yup.string().required(t("vehicleIsRequired")),
      otherwise: () => yup.string().notRequired(),
    }),
    workNumber: yup.string().required(t("workNumberIsRequired")),
    archiveNumber: yup.string().required(t("archiveNumberIsRequired")),
    uploadedFile: yup
      .mixed()
      .required(t("fileRequired"))
      .test("fileType", t("onlyPDFAllowed"), (value) => {
        if (!value) return true;
        return value.type === "application/pdf";
      }),
  });

  useEffect(() => {
    dispatch(fetchUsers(token));
    dispatch(fetchDrivers(token));
  }, [dispatch, token]);

  const handleUserSelect = (formik, selectedValue) => {
    if (!selectedValue) return;

    const [type, id] = selectedValue.split(":");

    if (type === "driver") {
      const driver = drivers.find((d) => d._id === id);
      if (driver) {
        const fullName = `${driver.firstName} ${driver.lastName}`;
        formik.setFieldValue("fullName", fullName); // Store just the name
        formik.setFieldValue("selectedValue", selectedValue); // Store the full value for reference
        formik.setFieldValue("idNumber", driver.idNumber);
        formik.setFieldValue("vehicle", driver.vehicle);
        formik.setFieldValue("workNumber", driver.employeeCompanyNumber);
        formik.setFieldValue("company", "Talabat");
      }
    } else if (type === "user") {
      const user = users.find((u) => u._id === id);
      if (user) {
        const fullName = `${user.firstName} ${user.lastName}`;
        formik.setFieldValue("fullName", fullName);
        formik.setFieldValue("selectedValue", selectedValue);
        formik.setFieldValue("idNumber", user.identification);
        formik.setFieldValue("vehicle", "None");
        formik.setFieldValue("workNumber", "");
        formik.setFieldValue("company", user.company || "");
      }
    }
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        formData.append(key, values[key]);
      });
      await dispatch(addArchive(formData));
    } catch (error) {
      console.error("Error adding archive:", error.message);
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
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel>{t("fullName")}</InputLabel>
                <Select
                  value={values.selectedValue}
                  onChange={(e) => {
                    handleChange(e);
                    handleUserSelect({ values, setFieldValue }, e.target.value);
                  }}
                  onBlur={handleBlur}
                  name="fullName"
                  error={!!touched.fullName && !!errors.fullName}
                >
                  <ListSubheader>{t("drivers")}</ListSubheader>
                  {drivers.map((driver) => (
                    <MenuItem key={driver._id} value={`driver:${driver._id}`}>
                      {driver.firstName} {driver.lastName}
                    </MenuItem>
                  ))}
                  <ListSubheader>{t("users")}</ListSubheader>
                  {users.map((user) => (
                    <MenuItem key={user._id} value={`user:${user._id}`}>
                      {user.firstName} {user.lastName} - ({user.role})
                    </MenuItem>
                  ))}
                </Select>
                {touched.fullName && errors.fullName && (
                  <Typography variant="caption" color="error">
                    {errors.fullName}
                  </Typography>
                )}
              </FormControl>

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
                value={values.idNumber}
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
                <InputLabel>{t("vehicle")}</InputLabel>
                <Select
                  value={values.vehicle}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="vehicle"
                  error={!!touched.vehicle && !!errors.vehicle}
                  disabled={!values.selectedValue?.startsWith("driver:")}
                  sx={{
                    // Optional: Style for disabled state
                    backgroundColor: !values.selectedValue?.startsWith(
                      "driver:"
                    )
                      ? colors.primary[400]
                      : "inherit",
                  }}
                >
                  <MenuItem value="Car">{t("car")}</MenuItem>
                  <MenuItem value="Bike">{t("bike")}</MenuItem>
                </Select>
                {touched.vehicle && errors.vehicle && (
                  <Typography variant="caption" color="error">
                    {errors.vehicle}
                  </Typography>
                )}
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
                  name="uploadedFile"
                  onBlur={handleBlur}
                  onChange={(event) => {
                    setFieldValue("uploadedFile", event.currentTarget.files[0]);
                  }}
                  error={!!touched.uploadedFile && !!errors.uploadedFile}
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
