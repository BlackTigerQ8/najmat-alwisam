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

  const driversAndUsers = useMemo(() => {
    if (!drivers || !users) return [];
    return [...drivers, ...users];
  }, [drivers, users]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    dispatch(fetchDrivers(token));
    dispatch(fetchUsers(token));
  }, [dispatch]);

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
      },
      {
        field: "position",
        headerName: t("position"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
    ],
    [t]
  );

  const isNonMobile = useMediaQuery("(min-width: 600px)");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSpendType, setSelectedSpendType] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const token = localStorage.getItem("token");

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
      <Header
        title={t("salaryReportTitle")}
        subtitle={t("salaryReportSubtitle")}
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
          rows={Array.isArray(driversAndUsers) ? driversAndUsers : []}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default SalaryReport;
