import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  useTheme,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import Header from "../components/Header";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import UpdateIcon from "@mui/icons-material/Update";
import { pulsar } from "ldrs";
import { useSelector, useDispatch } from "react-redux";
import { fetchSalaries, updateAdditionalSalary } from "../redux/usersSlice";
import { startOfMonth, endOfMonth } from "date-fns";
import { useReactToPrint } from "react-to-print";
import PrintableTable from "./PrintableTable";
import styles from "./Print.module.css";
import { useTranslation } from "react-i18next";

const EmployeesSalary = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const status = useSelector((state) => state.user.salariesStatus);
  const salaries = useSelector((state) => state.users.salaries).map(
    (salary, index) => ({ sequenceNumber: index + 1, ...salary })
  );
  const error = useSelector((state) => state.user.error);
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth());
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Employees Salary Report",
  });

  const handleStartMonthChange = (event) => {
    setStartMonth(event.target.value);
  };

  const handleStartYearChange = (event) => {
    setStartYear(event.target.value);
  };

  const handleEndMonthChange = (event) => {
    setEndMonth(event.target.value);
  };

  const handleEndYearChange = (event) => {
    setEndYear(event.target.value);
  };

  const netEmployeesSalaries = useMemo(() => {
    return salaries.reduce((total, employee) => {
      return (
        total +
        Number(employee.additionalSalary) +
        Number(employee.mainSalary) -
        Number(employee.companyDeductionAmount)
      );
    }, 0);
  }, [salaries]);

  const totalMonthlySalary = useMemo(() => {
    return salaries.reduce((total, employee) => {
      return total + Number(employee.mainSalary || 0);
    }, 0);
  }, [salaries]);

  const totalAdditionalSalary = useMemo(() => {
    return salaries.reduce((total, employee) => {
      return total + Number(employee.additionalSalary || 0);
    }, 0);
  }, [salaries]);

  const totalDeductions = useMemo(() => {
    return salaries.reduce((total, employee) => {
      return total + Number(employee.companyDeductionAmount || 0);
    }, 0);
  }, [salaries]);

  const totalNetSalary = useMemo(() => {
    return totalMonthlySalary + totalAdditionalSalary - totalDeductions;
  }, [totalMonthlySalary, totalAdditionalSalary, totalDeductions]);

  // Add calculateColumnSum helper function
  const calculateColumnSum = (fieldName) => {
    return salaries.reduce((total, employee) => {
      return total + Number(employee[fieldName] || 0);
    }, 0);
  };

  const sumRow = {
    _id: "sum-row",
    sequenceNumber: "",
    firstName: t("total"),
    lastName: "",
    mainSalary: calculateColumnSum("mainSalary"),
    additionalSalary: calculateColumnSum("additionalSalary"),
    companyDeductionAmount: calculateColumnSum("companyDeductionAmount"),
    totalSalary: totalNetSalary,
    remarks: "",
    actions: "",
  };

  const rowsWithSum = [...salaries, sumRow];

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "NO.",
      flex: 0.25,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1.25,
      cellClassName: "name-column--cell",
      renderCell: ({ row: { firstName, lastName } }) => {
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            borderRadius="4px"
          >
            {firstName} {lastName}
          </Box>
        );
      },
    },
    {
      field: "mainSalary",
      headerName: t("mainSalary"),
      flex: 0.75,
      type: Number,
      editable: false,
    },
    {
      field: "additionalSalary",
      headerName: t("additionalSalary"),
      flex: 1,
      editable: true,
      type: Number,
    },
    {
      field: "companyDeductionAmount",
      headerName: t("companyDeductionAmount"),
      flex: 1,
      //editable: true, //Intentionally commented this as deductions should be done through deduction form only
      type: Number,
    },
    {
      field: "totalSalary",
      headerName: t("netSalary"),
      flex: 1,
      renderCell: ({
        row: { additionalSalary, mainSalary, companyDeductionAmount },
      }) => {
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            borderRadius="4px"
          >
            {Number(additionalSalary) +
              Number(mainSalary) -
              Number(companyDeductionAmount)}
          </Box>
        );
      },
    },

    {
      field: "deductionReason",
      headerName: t("deductionReason"),
      flex: 1,
      //editable: true, //Intentionally commented this as deductions should be done through deduction form only
      type: String,
    },
    {
      field: "remarks",
      headerName: t("remarks"),
      flex: 1,
      editable: true,
    },

    {
      field: "actions",
      headerName: t("actions"),
      width: 100,
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

  const onSearchSubmit = async () => [
    dispatch(
      fetchSalaries({
        startDate: startOfMonth(new Date(startYear, startMonth)),
        endDate: endOfMonth(new Date(endYear, endMonth)),
      })
    ),
  ];

  useEffect(() => {
    dispatch(fetchSalaries());
  }, [dispatch]);

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
      const { additionalSalary, remarks } = row;
      dispatch(
        updateAdditionalSalary({
          userId: row._id,
          values: { additionalSalary, remarks },
        })
      );
    } catch (error) {
      console.error("Row does not have a valid _id field:", row);
    }
  };

  return (
    <Box m="20px">
      <Header
        title={t("EmployeesSalaryTitle")}
        subtitle={t("EmployeesSalarySubtitle")}
      />
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>{t("startMonth")}</InputLabel>
          <Select
            value={startMonth}
            onChange={handleStartMonthChange}
            label="Start Month"
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
          value={startYear}
          onChange={handleStartYearChange}
          sx={{ width: 100, mr: 2 }}
        />
        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>{t("endMonth")}</InputLabel>
          <Select
            value={endMonth}
            onChange={handleEndMonthChange}
            label="End Month"
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
          value={endYear}
          onChange={handleEndYearChange}
          sx={{ width: 100 }}
        />
        <Box display="flex" sx={{ gridColumn: "span 1" }} marginLeft={"20px"}>
          <Button
            onClick={onSearchSubmit}
            color="secondary"
            variant="contained"
          >
            {t("search")}
          </Button>
        </Box>
        <Box display="flex" sx={{ gridColumn: "span 1" }} marginLeft={"20px"}>
          <Button onClick={handlePrint} color="primary" variant="contained">
            {t("print")}
          </Button>
        </Box>
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
          // rows={Array.isArray(salaries) ? salaries : []}
          rows={rowsWithSum}
          columns={columns}
          getRowId={(row) => row._id}
          className={styles.grid}
        />

        <PrintableTable rows={salaries} columns={columns} ref={componentRef} />
        <Box mt="20px" className={styles.notes}>
          <Header title={t("notes")} />
          <Typography color={colors.greenAccent[500]} fontSize={24}>
            {t("employeesTotalNetSalary")}
            <strong>
              {" "}
              {netEmployeesSalaries} {t("kd")}
            </strong>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeesSalary;
