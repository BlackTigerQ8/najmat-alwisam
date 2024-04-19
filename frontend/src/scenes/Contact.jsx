import React, { useEffect } from "react";
import {
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

const initialValues = {
  selectedUsers: [],
  message: "",
};

const messageSchema = yup.object().shape({
  selectedUsers: yup
    .array()
    .min(1, "Please select at least one user")
    .required("required"),
  message: yup.string().required("required"),
});

const Contact = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.user);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const users = useSelector((state) => state.users.users);
  const userInfo = useSelector((state) => state.user.userInfo);
  const filteredUsers =
    userInfo.role === "Employee"
      ? users.filter((user) => user.role !== "Admin")
      : users;
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");

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
    try {
      await dispatch(
        sendMessage({
          selectedUsers: values.selectedUsers,
          message: values.message,
        })
      );

      resetForm();

      console.log("Messages sent successfully!");
    } catch (error) {
      console.error("Error sending messages:", error);
    }
  };

  return (
    <Box m="20px">
      <Header
        title="CONTACTS"
        subtitle="List of Contacts for Future Reference"
      />
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
                  "& > div": {
                    gridColumn: isNonMobile ? undefined : "span 4",
                  },
                }}
              >
                <FormControl
                  fullWidth
                  sx={{ gridColumn: "span 4", position: "relative" }}
                >
                  <InputLabel id="select-user-label">Select User</InputLabel>
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
                  multiline
                  rows={4}
                  variant="filled"
                  type="text"
                  label="Message"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.message}
                  name="message"
                  error={!!touched.message && !!errors.message}
                  helperText={touched.message && errors.message}
                  sx={{ gridColumn: "span 4" }}
                />
              </Box>
              <Box display="flex" justifyContent="end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  Send
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
