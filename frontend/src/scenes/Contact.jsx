import React, { useEffect, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import * as yup from "yup";
import { tokens } from "../theme";
import Header from "../components/Header";
import useMediaQuery from "@mui/material/useMediaQuery";
import { pulsar } from "ldrs";
import { Formik } from "formik";
import { fetchUsers, sendMessage } from "../redux/usersSlice";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const initialValues = {
  selectedUsers: [],
  title: "",
  message: "",
  file: null,
};

const messageSchema = yup.object().shape({
  selectedUsers: yup
    .array()
    .min(1, "Please select at least one user")
    .required("required"),
  title: yup.string().required("required"),
  message: yup.string().required("required"),
  file: yup.mixed(),
});

const Contact = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.user);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const users = useSelector((state) => state.users.users);
  const userInfo = useSelector((state) => state.user.userInfo);
  const filteredUsers =
    userInfo.role === "Employee"
      ? users.filter((user) => user.role !== "Admin")
      : users;
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers(token));
  }, [token]);
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

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", values.file);
      formData.append("selectedUsers", JSON.stringify(values.selectedUsers));

      Object.keys(values).forEach((key) => {
        if (key !== "file" && key !== "selectedUsers" && values[key]) {
          formData.append(key, values[key]);
        }
      });

      await dispatch(sendMessage(formData));
      resetForm();
    } catch (error) {
      console.error("Error sending messages:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <Header title={t("contactTitle")} subtitle={t("contactSubtitle")} />
      <Box
        mt="40px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <Formik
          onSubmit={handleSubmit}
          validationSchema={messageSchema}
          initialValues={initialValues}
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
                  sx={{ gridColumn: "span 4", position: "relative" }}
                >
                  <InputLabel id="select-user-label">
                    {t("selectUser")}
                  </InputLabel>
                  <Select
                    labelId="select-user-label"
                    id="select-users"
                    multiple
                    value={values.selectedUsers || []}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.selectedUsers && !!errors.selectedUsers}
                    name="selectedUsers"
                    label="Select Users"
                  >
                    {filteredUsers.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} - ({user.role})
                      </MenuItem>
                    ))}
                  </Select>
                  {values.selectedUsers.length > 0 && (
                    <IconButton
                      onClick={() => setFieldValue("selectedUsers", [])}
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: "8px",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  )}
                </FormControl>

                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={t("subject")}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.title}
                  name="title"
                  error={!!touched.title && !!errors.title}
                  helperText={touched.title && errors.title}
                  sx={{ gridColumn: "span 4" }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="filled"
                  type="text"
                  label={t("message")}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.message}
                  name="message"
                  error={!!touched.message && !!errors.message}
                  helperText={touched.message && errors.message}
                  sx={{ gridColumn: "span 4" }}
                />

                <Box sx={{ gridColumn: "span 4" }}>
                  <input
                    accept="application/pdf"
                    style={{ display: "none" }}
                    id="message-file"
                    type="file"
                    onChange={(event) => {
                      setFieldValue("file", event.currentTarget.files[0]);
                    }}
                  />
                  <label htmlFor="message-file">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<AttachFileIcon />}
                    >
                      {t("attachFile")}
                    </Button>
                  </label>
                  {values.file && (
                    <Box mt={1}>
                      {values.file.name}
                      <IconButton
                        onClick={() => setFieldValue("file", null)}
                        size="small"
                      >
                        <ClearIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
              <Box display="flex" justifyContent="end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  {t("send")}
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default Contact;
