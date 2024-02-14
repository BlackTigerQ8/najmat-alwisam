import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";
import { fetchDrivers } from "../redux/driversSlice";
import { fetchUsers } from "../redux/usersSlice";
import { useDispatch, useSelector } from "react-redux";

const initialValues = {
  deductionReason: "",
  talabatDeductionAmount: "",
  companyDeductionAmount: "",
  selectedDriver: "",
};

const userSchema = yup.object().shape({
  deductionReason: yup.string().required("required"),
  talabatDeductionAmount: yup.string().required("required"),
  companyDeductionAmount: yup.string().required("required"),
});

const Deduction = () => {
  const dispatch = useDispatch();
  const isNonMobile = useMediaQuery("(min-width: 600px)");

  const drivers = useSelector((state) => state.drivers.drivers);
  const users = useSelector((state) => state.users.users);
  const [selectedDriver, setSelectedDriver] = useState("");
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");

  useEffect(() => {
    dispatch(fetchDrivers(token));
    dispatch(fetchUsers(token));
  }, [token]);

  return (
    <Box m="20px">
      <Header
        title="DEDUCT SALARY"
        subtitle="Deduct Salary from Employee/Driver"
      />
      <Formik initialValues={initialValues}>
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
              <FormControl fullWidth sx={{ gridColumn: "span 4" }}>
                <InputLabel id="select-driver-label">Select Driver</InputLabel>
                <Select
                  labelId="select-driver-label"
                  id="select-driver"
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  onBlur={handleBlur}
                  error={!!touched.selectedDriver && !!errors.selectedDriver}
                  name="selectedDriver"
                  label="Select Driver"
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver._id} value={driver._id}>
                      {driver.name}
                    </MenuItem>
                  ))}
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                variant="filled"
                type=""
                label="Reason of deduction"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.deductionReason}
                name="deductionReason"
                error={!!touched.deductionReason && !!errors.deductionReason}
                helperText={touched.deductionReason && errors.deductionReason}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Talabat deduction amount (K.D.)"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.talabatDeductionAmount}
                name="talabatDeductionAmount"
                error={
                  !!touched.talabatDeductionAmount &&
                  !!errors.talabatDeductionAmount
                }
                helperText={
                  touched.talabatDeductionAmount &&
                  errors.talabatDeductionAmount
                }
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Company deduction amount (K.D.)"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.companyDeductionAmount}
                name="companyDeductionAmount"
                error={
                  !!touched.companyDeductionAmount &&
                  !!errors.companyDeductionAmount
                }
                helperText={
                  touched.companyDeductionAmount &&
                  errors.companyDeductionAmount
                }
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Submit
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Deduction;
