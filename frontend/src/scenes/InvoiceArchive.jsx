import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Select,
  useTheme,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  IconButton,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
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
  fetchEmployeeInvoices,
  searchArchivedInvoices,
} from "../redux/invoiceSlice";
import { Formik } from "formik";

const initialValues = {
  startDate: "",
  endDate: "",
  selectedDriver: [],
};

const searchSchema = yup.object().shape({
  startDate: yup.string().required("Select starting date"),
  endDate: yup.string().required("Select ending date"),
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

  const invoices = useSelector(
    (state) => state.invoice?.archivedDriverInvoices || []
  );

  const [selectedDriverIds, setSelectedDriverIds] = useState([])

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
        if (
          invoice.mainOrder ||
          invoice.additionalOrder ||
          invoice.hour ||
          invoice.cash
        ) {
          result.invoiceDate = invoice.invoiceDate;
        }

        return result;
      }, {});
    },
    [invoices]
  );

  const driverWithInvoices = useMemo(() => {
    const invoices = drivers.map((driver) => {
      const { cash, hour, mainOrder, additionalOrder, invoiceDate } =
        getInvoiceData(driver._id);

      return {
        ...driver,
        cash: cash ? cash.toFixed(2) : cash,
        hour,
        mainOrder,
        additionalOrder,
        invoiceDate,
      };
    });

    if(!selectedDriverIds.length) return invoices

    return invoices.filter(invoice => selectedDriverIds.includes(invoice._id))
  }, [drivers, getInvoiceData, selectedDriverIds]);

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
      flex: 0.2,
    },
    {
      field: "invoiceDate",
      headerName: "Date",
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => {
        if (!params.value) return "";

        const date = new Date(params.value);
        const formattedDate = `${date.getDate()}/${
          date.getMonth() + 1
        }/${date.getFullYear()}`;
        return formattedDate;
      },
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

  function handleSubmit(values) {
    setSelectedDriverIds(values.selectedDriver || [])
    dispatch(searchArchivedInvoices(values));
  }

 

  return (
    <Box m="20px">
      <Header title="Archived Invoices" subtitle="List of archived invoices" />
      <Formik
        initialValues={initialValues}
        validationSchema={searchSchema}
        onSubmit={handleSubmit}
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
              gridTemplateColumns="repeat(5, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 5" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="Starting Date"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.startDate}
                name="startDate"
                error={!!touched.startDate && !!errors.startDate}
                helperText={touched.startDate && errors.startDate}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="Ending Date"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.endDate}
                name="endDate"
                error={!!touched.endDate && !!errors.endDate}
                helperText={touched.endDate && errors.endDate}
                sx={{ gridColumn: "span 1" }}
              />
              <FormControl
                fullWidth
                sx={{ gridColumn: "span 2", position: "relative" }}
              >
                <InputLabel id="select-driver-label">Select Driver</InputLabel>
                <Select
                  labelId="select-driver-label"
                  id="select-drivers"
                  multiple
                  value={values.selectedDriver || []}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.selectedDriver && !!errors.selectedDriver}
                  name="selectedDriver"
                  label="Select Drivers"
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver._id} value={driver._id}>
                      {driver.firstName} {driver.lastName}
                    </MenuItem>
                  ))}
                </Select>
                {values.selectedDriver.length > 0 && (
                  <IconButton
                    onClick={() => setFieldValue("selectedDriver", [])}
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
