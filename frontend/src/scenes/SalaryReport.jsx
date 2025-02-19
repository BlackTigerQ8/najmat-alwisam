import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Modal,
  IconButton,
} from "@mui/material";
import { tokens } from "../theme";
import { useSelector, useDispatch } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { fetchDrivers } from "../redux/driversSlice";
import { fetchUsers } from "../redux/usersSlice";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import PrintableTable from "./PrintableTable";
import styles from "./Print.module.css";
import { pulsar } from "ldrs";

const SalaryReport = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const componentRef = useRef();

  const {
    status: driversStatus,
    drivers,
    error: driversError,
  } = useSelector((state) => state.drivers);
  const {
    status: usersStatus,
    users,
    error: usersError,
  } = useSelector((state) => state.users);
  const filteredUsers = users.filter((user) => user.role !== "Admin");

  const driversAndUsers = useMemo(() => {
    if (!drivers || !filteredUsers) return [];
    return [...drivers, ...filteredUsers];
  }, [drivers, filteredUsers]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    dispatch(fetchDrivers(token));
    dispatch(fetchUsers(token));
  }, [dispatch]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Salary Report",
  });

  const totalSalary = useMemo(() => {
    return driversAndUsers.reduce((total, employee) => {
      return total + Number(employee.mainSalary || 0);
    }, 0);
  }, [driversAndUsers]);

  const columns = useMemo(
    () => [
      { field: "phone", headerName: t("phone"), flex: 1 },
      {
        field: "id",
        headerName: t("idNumber"),
        flex: 1,
        align: "center",
        headerAlign: "center",
        valueGetter: (params) => {
          return params.row.identification || params.row.idNumber;
        },
      },
      {
        field: "name",
        headerName: t("name"),
        flex: 1,
        align: "center",
        headerAlign: "center",
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
        field: "iban",
        headerName: t("iban"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "mainSalary",
        headerName: t("salary"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "bankName",
        headerName: t("bankName"),
        flex: 1,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          return t(params.value);
        },
      },
      {
        field: "position",
        headerName: t("position"),
        flex: 1,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          return t(params.value);
        },
      },
    ],
    [t]
  );

  pulsar.register();
  if (driversStatus === "loading" || usersStatus === "loading") {
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

  if (driversStatus === "failed" || usersStatus === "failed") {
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
        Error: {driversError || usersError}
      </div>
    );
  }

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title={t("salaryReportTitle")}
          subtitle={t("salaryReportSubtitle")}
        />
        <Button
          variant="contained"
          onClick={handlePrint}
          sx={{
            backgroundColor: colors.blueAccent[600],
            "&:hover": { backgroundColor: colors.blueAccent[500] },
          }}
        >
          {t("print")}
        </Button>
      </Box>
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
          rows={Array.isArray(driversAndUsers) ? driversAndUsers : []}
          columns={columns}
          getRowId={(row) => row._id}
        />

        {/* Summary section */}
        <Box mt="20px" className={styles.notes}>
          <Box
            mt={4}
            p={3}
            bgcolor={colors.primary[400]}
            borderRadius="4px"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              padding="20px"
              borderRadius="8px"
              width="50%"
            >
              <Typography variant="h6" color={colors.greenAccent[500]}>
                {t("totalMonthlySalary")}
              </Typography>
              <Typography variant="h4">
                {(totalSalary || 0).toFixed(3)} {t("kd")}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* PrintableTable component */}
        <PrintableTable
          rows={driversAndUsers}
          columns={columns}
          ref={componentRef}
          orientation="portrait"
          summary={{
            totalSalary,
          }}
        />
      </Box>
    </Box>
  );
};

export default SalaryReport;
