import React from "react";
import {
  Box,
  Button,
  TextField,
  InputLabel,
  FormControl,
  Input,
} from "@mui/material";

import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";

const initialValues = {
  yesterdayDate: new Date(new Date().setDate(new Date().getDate() - 1))
    .toISOString()
    .split("T")[0],
  orders: "",
  driverName: "",
  workingHours: "",
  cashReceived: "",
  uploadedFile: null,
};

const userSchema = yup.object().shape({
  driverName: yup.string().required("required"),
  yesterdayDate: yup.string().required("required"),
  orders: yup.string().required("required"),
  workingHours: yup.string().required("required"),
  cashReceived: yup.string().required("required"),
  additionalFile: yup.string(),
});

const DriverWork = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");

  const handleFormSubmit = (values) => {
    console.log(values);
  };

  return (
    <Box m="20px">
      <Header title="DRIVER WORK" subtitle="Enter The Driver Work Data" />

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
                label="Driver's Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.driverName}
                name="driverName"
                error={!!touched.driverName && !!errors.driverName}
                helperText={touched.driverName && errors.driverName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Yesterday's Date"
                value={values.yesterdayDate}
                // Disable the field to prevent editing by the user
                disabled
                name="yesterdayDate"
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Orders"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.orders}
                name="orders"
                error={!!touched.orders && !!errors.orders}
                helperText={touched.orders && errors.orders}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Working Hours"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.workingHours}
                name="workingHours"
                error={!!touched.workingHours && !!errors.workingHours}
                helperText={touched.workingHours && errors.workingHours}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Cash Received"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.cashReceived}
                name="cashReceived"
                error={!!touched.cashReceived && !!errors.cashReceived}
                helperText={touched.cashReceived && errors.cashReceived}
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

export default DriverWork;
