import React from "react";
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
} from "@mui/material";
import Header from "../components/Header";
import { tokens } from "../theme";
// import { NewtonsCradle } from "@uiball/loaders";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSelector, useDispatch } from "react-redux";
// import { trefoil } from "ldrs";
import { pulsar } from "ldrs";
import { ErrorMessage, Formik } from "formik";
import { updateUser } from "../redux/usersSlice";
import { useParams } from "react-router-dom";
import * as Yup from "yup";

const UserProfile = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users ?? []);
  const params = useParams();
  const userInfo = users.find((d) => d._id === params.id);

  const status = useSelector((state) => state.users.status);
  const error = useSelector((state) => state.users.error);

  const initialValues = userInfo || {
    sequenceNumber: null,
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    identification: "",
    visa: "",
    contractExpiryDate: "",
    role: "",
    passport: "",
    password: "",
    createdAt: Date,
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
          if (key !== "uploadedFile" && key !== "__v") {
            formData.append(key, values[key] || undefined);
          }
        });

        if (values.uploadedFile)
          formData.append("uploadedFile", values.uploadedFile);

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

  return (
    <Box m="20px">
      <Header title="USER PROFILE" subtitle="View/Update User Information" />
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
                label="Email"
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
                label="VISA"
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
                label="Password"
                onBlur={handleBlur}
                onChange={handleChange}
                // value={values.password}
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

              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel htmlFor="role">Role</InputLabel>
                <Select
                  label="role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="role"
                  error={!!touched.role && !!errors.role}
                  helperText={touched.role && errors.role}
                >
                  {/* <MenuItem value={"Admin"}>Admin</MenuItem> */}
                  <MenuItem value={"Manager"}>Manager</MenuItem>
                  <MenuItem value={"Accountant"}>Accountant</MenuItem>
                  <MenuItem value={"Employee"}>Employee</MenuItem>
                </Select>
              </FormControl>

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
                  disabled={!values.uploadedFile && !userInfo.file}
                >
                  View Uploaded File
                </Button>
              </FormControl>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Update User
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default UserProfile;
