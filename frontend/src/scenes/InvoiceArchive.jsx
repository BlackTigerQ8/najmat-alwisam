import React, { useMemo, useEffect, useState, useCallback } from "react";
import { Box, Button, Select, useTheme, MenuItem, InputLabel, FormControl, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
import { useSelector, useDispatch } from "react-redux";
import { fetchDrivers } from "../redux/driversSlice";
import { pulsar } from "ldrs";
import useMediaQuery from "@mui/material/useMediaQuery";
import * as yup from "yup";
import {
  fetchArchivedInvoices,
  createDriverInvoice,
  fetchEmployeeInvoices,
  searchArchivedInvoices,
} from "../redux/invoiceSlice";
import { Formik } from "formik";

const initialValues = {
  month: "",
  year: new Date().getFullYear()
};

const searchSchema = yup.object().shape({
  month: yup.number().required("Select a month"),
  year: yup.number().required("Select a year"),
});


const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const drivers = useSelector((state) => state.drivers.drivers);
  const status = useSelector((state) => state.drivers.status);
  const error = useSelector((state) => state.drivers.error);
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");

  const invoices = useSelector((state) => state.invoice?.archivedDriverInvoices || []);

  const getInvoiceData = useCallback(
    (driverId) => {
      const driverInvoices = invoices.filter(
        (invoice) => invoice.driver._id === driverId
      );

      return driverInvoices.reduce((result, invoice) => {
        result.mainOrder = invoice.mainOrder + (result.mainOrder || 0);
        result.additionalOrder =
          invoice.additionalOrder + (result.additionalOrder || 0);
        result.hour = invoice.hour + (result.hour || 0);
        result.cash = invoice.cash + (result.cash || 0);
        result.additionalSalary =
          invoice.additionalSalary + (result.additionalSalary || 0);
        result.deductionAmount =
          (invoice.deductionAmount || 0) + (result.deductionAmount || 0);

        return result;
      }, {});
    },
    [invoices]
  );

  const driverWithInvoices = useMemo(() => {
    return drivers.map((driver) => {
      const { cash, hour, mainOrder, additionalOrder } = getInvoiceData(
        driver._id
      );

      return { ...driver, cash, hour, mainOrder, additionalOrder };
    });
  }, [drivers, getInvoiceData]);

  const [editRowsModel, setEditRowsModel] = useState({});
  

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "NO.",
    },
    {
      field: "name",
      headerName: "Name",
      flex: 0.75,
      cellClassName: "name-column--cell",
      renderCell: ({ row: { firstName, lastName } }) => {
        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {firstName} {lastName}
          </Box>
        );
      },
    },

    {
      field: "phone",
      headerName: "Phone Number",
      justifyContent: "center",
    },
    {
      field: "idNumber",
      headerName: "Civil ID",
      type: Number,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "cash",
      headerName: "Cash",
      type: Number,
    },
    {
      field: "hour",
      headerName: "Hours",
    },
    {
      field: "mainOrder",
      headerName: "Main orders",
    },
    {
      field: "additionalOrder",
      headerName: "Additional orders",
      flex: 0.2
    },
  ];

  

  useEffect(() => {
    
    dispatch(fetchDrivers(token));
    dispatch(fetchArchivedInvoices(token));
    dispatch(fetchEmployeeInvoices(token));
    
  }, [token, dispatch]);

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

  

  function handleSubmit(values){
    dispatch(searchArchivedInvoices(values))
  }

  return (
    <Box m="20px">
      <Header title="Archived Invoices" subtitle="List of archived invoices" />
      <Formik initialValues={initialValues} validationSchema={searchSchema} onSubmit={handleSubmit}>
        {({
         values,
         errors,
         touched,
         handleBlur,
         handleChange,
         handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(5, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 5" },
              }}
            >
               <FormControl
                    fullWidth
                    variant="filled"
                    sx={{ gridColumn: "span 1" }}
                  >
                    <InputLabel htmlFor="month">
                      Select month
                    </InputLabel>
              <Select
                      label="month"
                      value={values.month}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      name="month"
                      error={
                        !!touched.month &&
                        !!errors.month
                      }
                      helperText={
                        touched.month && errors.month
                      }
                    >
                      {
                        Array.from({ length: 12 }, (_, index) => <MenuItem value={index+1} key={index +1}>{index+1}</MenuItem>)
                      }
                      
                      
                    </Select>
                    </FormControl>

                    <TextField
                    fullWidth
                    variant="filled"
                    type="number"
                    label="Year"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.year}
                    name="year"
                    error={!!touched.year && !!errors.year}
                    helperText={touched.year && errors.year}
                    sx={{ gridColumn: "span 1" }}
                  />
              <Button type="submit" color="secondary" variant="contained">
                Search
              </Button>
            </Box>
          </form>
        )}
      </Formik>

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
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          // checkboxSelection
          rows={Array.isArray(driverWithInvoices) ? driverWithInvoices : []}
          columns={columns}
          getRowId={(row) => row._id}
          editRowsModel={editRowsModel}
          onEditRowsModelChange={(newModel) => setEditRowsModel(newModel)}
        />
      </Box>
    </Box>
  );
};

export default Invoices;
