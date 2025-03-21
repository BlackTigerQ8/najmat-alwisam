import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useTheme,
  Box,
  Button,
  Typography,
  TextField,
  useMediaQuery,
  Modal,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import * as XLSX from "xlsx";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
const SalaryReport = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const componentRef = useRef();

  const [dateRange, setDateRange] = useState({
    startYear: new Date().getFullYear(),
    startMonth: new Date().getMonth(),
    startDay: 1,
    endYear: new Date().getFullYear(),
    endMonth: new Date().getMonth(),
    endDay: new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate(),
  });

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getDaysArray = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleDateChange = (field) => (event) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSearch = () => {
    const token = localStorage.getItem("token");
    const startDate = new Date(
      Date.UTC(
        dateRange.startYear,
        dateRange.startMonth,
        dateRange.startDay,
        0,
        0,
        0
      )
    );
    const endDate = new Date(
      Date.UTC(
        dateRange.endYear,
        dateRange.endMonth,
        dateRange.endDay,
        23,
        59,
        59
      )
    );

    console.log(
      "startDate:",
      startDate.toISOString().split("T")[0],
      "endDate:",
      endDate.toISOString().split("T")[0]
    );
    dispatch(fetchDrivers(token, startDate, endDate));
    dispatch(fetchUsers(token, startDate, endDate));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    dispatch(fetchDrivers(token));
    dispatch(fetchUsers(token));
  }, [dispatch]);

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

  const handleDownloadExcel = () => {
    // Prepare data for Excel
    const excelData = driversAndUsers.map((row, index) => ({
      [t("no")]: index + 1,
      [t("phone")]: row.phone,
      [t("idNumber")]: row.identification || row.idNumber,
      [t("name")]: `${row.firstName} ${row.lastName}`,
      [t("iban")]: row.iban,
      [t("salary")]: row.mainSalary,
      [t("bankName")]: t(row.bankName),
      [t("position")]: t(row.position),
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Salary Report");

    // Save file
    XLSX.writeFile(wb, "salary_report.xlsx");
  };

  const columns = useMemo(
    () => [
      {
        field: "sequenceNumber",
        headerName: t("no"),
        flex: 0.2,
        renderCell: (params) => {
          if (params.row._id === "sum-row") {
            return "";
          }
          const currentIndex = driversAndUsers.findIndex(
            (row) => row._id === params.row._id
          );
          return currentIndex + 1;
        },
        sortable: false,
      },
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
      </Box>
      {/* Add date controls */}
      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="flex-start"
        gap={2}
        mb={2}
        mt={2}
      >
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Start Date Controls */}
          <Box display="flex">
            <FormControl sx={{ minWidth: 120, mr: 1 }}>
              <Select
                value={dateRange.startDay}
                onChange={handleDateChange("startDay")}
              >
                {getDaysArray(dateRange.startYear, dateRange.startMonth).map(
                  (day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120, mr: 1 }}>
              <InputLabel>{t("startMonth")}</InputLabel>
              <Select
                value={dateRange.startMonth}
                onChange={handleDateChange("startMonth")}
                label={t("startMonth")}
              >
                {[...Array(12).keys()].map((month) => (
                  <MenuItem key={month} value={month}>
                    {new Date(0, month).toLocaleString("default", {
                      month: "long",
                    })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="number"
              label={t("startYear")}
              value={dateRange.startYear}
              onChange={handleDateChange("startYear")}
              sx={{ width: 100 }}
            />
          </Box>

          {/* End Date Controls */}
          <Box>
            <FormControl sx={{ minWidth: 120, mr: 1 }}>
              <Select
                value={dateRange.endDay}
                onChange={handleDateChange("endDay")}
              >
                {getDaysArray(dateRange.endYear, dateRange.endMonth).map(
                  (day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120, mr: 1 }}>
              <InputLabel>{t("endMonth")}</InputLabel>
              <Select
                value={dateRange.endMonth}
                onChange={handleDateChange("endMonth")}
                label={t("endMonth")}
              >
                {[...Array(12).keys()].map((month) => (
                  <MenuItem key={month} value={month}>
                    {new Date(0, month).toLocaleString("default", {
                      month: "long",
                    })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="number"
              label={t("endYear")}
              value={dateRange.endYear}
              onChange={handleDateChange("endYear")}
              sx={{ width: 100 }}
            />
          </Box>
        </Box>
        <Button
          onClick={handleSearch}
          color="secondary"
          variant="contained"
          sx={{
            height: "fit-content",
            alignSelf: "flex-end",
            height: "50px",
            px: 4,
          }}
        >
          {t("search")}
        </Button>
      </Box>
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleDownloadExcel}
          startIcon={<DownloadIcon />}
          sx={{
            backgroundColor: colors.blueAccent[600],
            "&:hover": { backgroundColor: colors.blueAccent[500] },
            marginRight: "10px",
          }}
        >
          {t("download")}
        </Button>
        <Button
          variant="contained"
          onClick={handlePrint}
          startIcon={<PrintIcon />}
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
            borderBottom: `1px solid ${colors.grey[400]}`,
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
