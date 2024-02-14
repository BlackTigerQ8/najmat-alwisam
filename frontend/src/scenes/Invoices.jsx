import React, { useMemo, useEffect, useState, useCallback } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
import UpdateIcon from "@mui/icons-material/Update";
import { useSelector, useDispatch } from "react-redux";
import { fetchDrivers } from "../redux/driversSlice";
import { pulsar } from "ldrs";
import {
  fetchInvoices,
  createDriverInvoice,
} from "../redux/driverInvoiceSlice";

const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const drivers = useSelector((state) => state.drivers.drivers);
  const status = useSelector((state) => state.drivers.status);
  const error = useSelector((state) => state.drivers.error);
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");

  const invoices = useSelector((state) => state.driverInvoice?.driverInvoice || []);

  const getInvoiceData = useCallback(
    (driverId) => {
      const driverInvoices = invoices.filter(
        (invoice) => invoice.driver._id === driverId
      );

      return driverInvoices.reduce((result, invoice) => {
        result.order = invoice.order + (result.order || 0);
        result.hour = invoice.hour + (result.hour || 0);
        result.cash = invoice.cash + (result.cash || 0);
        result.additionalSalary = invoice.additionalSalary + (result.additionalSalary || 0);
        result.deductionAmount = invoice.deductionAmount + (result.deductionAmount || 0);

        return result
      }, {})
    },
    [invoices]
  );

  const driverWithInvoices = useMemo(() => {

return drivers.map(driver => {
  const {cash, hour, order} = getInvoiceData(driver._id);

  return {...driver, cash, hour, order}
})

    


  }, [drivers, invoices])

  const [editRowsModel, setEditRowsModel] = useState({});
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "NO.",
    },
    {
      field: "name",
      headerName: "Name",
      flex: 0.25,
      cellClassName: "name-column--cell",
      renderCell: ({ row: { firstName, lastName } }) => {
        return (
          <Box
            display="flex"
            justifyContent="center"
            borderRadius="4px"
          >
            {firstName} {lastName}
          </Box>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 0.25,
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex:0.1
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
      editable: true,
      type: Number,
    },
    {
      field: "hour",
      headerName: "Hours",
      editable: true,
    },
    {
      field: "order",
      headerName: "Orders",
      editable: true,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginRight: 8 }}
              onClick={() => handleUpdate(params.row)}
              startIcon={<UpdateIcon />}
            ></Button>
          </Box>
        );
      },
    },
  ];

  useEffect(() => {
    //if (status === "succeeded") {
    dispatch(fetchDrivers(token));
    dispatch(fetchInvoices(token));
    //}
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

  const handleUpdate = (row) => {
    try {
      const { cash, order, hour } = row;
      dispatch(
        createDriverInvoice({  values: { cash, order, hour,driverId: row._id } })
      );
    } catch (error) {
      console.error("Row does not have a valid _id field:", row);
    }
  };

  const handleUpdateAll = () => {
    // Update all rows in the DataGrid
    selectedRowIds.forEach((id) => {
      const row = drivers.find((driver) => driver._id === id);
      if (row) {
        console.log(row);
        handleUpdate(row);
      }
    });
  };

  return (
    <Box m="20px">
      <Header title="INVOICES" subtitle="List of Invoice Blanaces" />
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
        <Button
          variant="contained"
          color="secondary"
          size="large"
          style={{ marginTop: 8 }}
          onClick={handleUpdateAll}
        >
          Update All
        </Button>
      </Box>
    </Box>
  );
};

export default Invoices;
