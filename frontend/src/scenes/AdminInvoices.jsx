import React, { useEffect, useMemo } from "react";
import { Alert, Box, Button, useTheme } from "@mui/material";
import Header from "../components/Header";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import { pulsar } from "ldrs";
import { useSelector, useDispatch } from "react-redux";
import { fetchDrivers } from "../redux/driversSlice";
import {
  fetchInvoices,
  updateDriverInvoice,
  fetchEmployeeInvoices,
  updateEmployeeInvoice,
} from "../redux/invoiceSlice";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminInvoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const drivers = useSelector((state) => state.drivers.drivers);
  const params = useParams();
  const driverInfo = drivers.find((d) => d._id === params.id);
  const driverInvoiceStatus = useSelector((state) => state.invoice.status);
  const employeeInvoiceStatus = useSelector(
    (state) => state.invoice.employeeInvoicesStatus
  );
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");

  const status =
    driverInvoiceStatus === "loading" || driverInvoiceStatus === "failed"
      ? driverInvoiceStatus
      : employeeInvoiceStatus;
  const driverInvoiceError = useSelector((state) => state.invoice.error);
  const employeeInvoiceError = useSelector(
    (state) => state.invoice.employeeInvoicesError
  );
  const error = driverInvoiceError || employeeInvoiceError;

  const invoices = useSelector((state) => state.invoice?.driverInvoices);
  const userInvoices = useSelector((state) => state.invoice?.employeeInvoices);

  const combinedInvoices = useMemo(() => {
    console.log("Driver Invoices:", invoices);
    console.log("Employee Invoices:", userInvoices);

    const combinedInvoices = [];
    let sequenceNumber = 1;

    for (const driverInvoice of invoices) {
      if (
        !driverInvoice.additionalSalary &&
        !driverInvoice.companyDeductionAmount &&
        !driverInvoice.talabatDeductionAmount
      ) {
        continue;
      }

      combinedInvoices.push({
        id: driverInvoice._id,
        sequenceNumber,
        additionalSalary: driverInvoice.additionalSalary,
        companyDeductionAmount: driverInvoice.companyDeductionAmount,
        deductionReason: driverInvoice.deductionReason,
        talabatDeductionAmount: driverInvoice.talabatDeductionAmount,
        ...driverInvoice.driver,
        type: "driver",
        file: driverInvoice.file,
      });

      sequenceNumber++;
    }

    for (const userInvoice of userInvoices) {
      if (
        !userInvoice.additionalSalary &&
        !userInvoice.companyDeductionAmount
      ) {
        continue;
      }

      combinedInvoices.push({
        id: userInvoice._id,
        sequenceNumber,
        additionalSalary: userInvoice.additionalSalary,
        companyDeductionAmount: userInvoice.companyDeductionAmount,
        deductionReason: userInvoice.deductionReason,
        talabatDeductionAmount: 0,
        type: "user",
        ...userInvoice.user,
        file: userInvoice.file,
      });

      sequenceNumber++;
    }

    return combinedInvoices;
  }, [invoices, userInvoices]);

  useEffect(() => {
    dispatch(fetchDrivers(token));
    dispatch(fetchInvoices(token));
    dispatch(fetchEmployeeInvoices(token));
  }, [dispatch, token]);

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "NO.",
      flex: 0.5,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1.75,
      cellClassName: "name-column--cell",
      renderCell: ({ row: { firstName, lastName, type } }) => {
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            borderRadius="4px"
          >
            {firstName} {lastName}{" "}
            {type === "Employee" ? `(${t("employee")})` : ""}
          </Box>
        );
      },
    },
    {
      field: "mainSalary",
      headerName: t("mainSalary"),
      flex: 1,
    },
    {
      field: "additionalSalary",
      headerName: t("additionalSalary"),
      flex: 1,
    },
    {
      field: "talabatDeductionAmount",
      headerName: t("talabatDeductionAmount"),
      flex: 1,
    },
    {
      field: "companyDeductionAmount",
      headerName: t("companyDeductionAmount"),
      flex: 1,
    },
    {
      field: "deductionReason",
      headerName: t("deductionReason"),
      flex: 1,
    },
    {
      field: "preview",
      headerName: t("preview"),
      width: 150,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (!params.row.file) return null;
        return (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleViewFile(params.row)}
          >
            <RemoveRedEyeOutlinedIcon />
          </Button>
        );
      },
    },
    {
      field: "actions",
      headerName: t("actions"),
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
              onClick={() =>
                handleUpdate({
                  id: params.row.id,
                  status: "adminRejected",
                  type: params.row.type,
                })
              }
              startIcon={<CloseOutlinedIcon />}
            />
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() =>
                handleUpdate({
                  id: params.row.id,
                  status: "approved",
                  type: params.row.type,
                })
              }
              startIcon={<CheckOutlinedIcon />}
            />
          </Box>
        );
      },
    },
  ];

  useEffect(() => {
    //if (status === "succeeded") {
    dispatch(fetchDrivers(token));
    dispatch(fetchInvoices(token));
    dispatch(fetchEmployeeInvoices(token));
    //}
  }, [dispatch, token]);

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
      <Alert
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Error: {error}
      </Alert>
    );
  }

  const handleUpdate = ({ id, status, type }) => {
    try {
      if (type === "driver") {
        return dispatch(updateDriverInvoice({ values: { id, status } }));
      }

      if (type === "user") {
        return dispatch(updateEmployeeInvoice({ values: { id, status } }));
      }
    } catch (error) {
      console.error("Row does not have a valid _id field:");
    }
  };

  const handleViewFile = (values) => {
    const decodedPath = decodeURIComponent(values.file);
    const fileUrl = decodedPath
      ? `${process.env.REACT_APP_API_URL}/${decodedPath}`
      : null;

    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <Box m="20px">
      <Header
        title={t("deductionSalaryTitle")}
        subtitle={t("deductionSalaryRequest")}
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
        }}
      >
        <DataGrid
          rows={Array.isArray(combinedInvoices) ? combinedInvoices : []}
          columns={columns}
        />
      </Box>
    </Box>
  );
};

export default AdminInvoices;
