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
  useMediaQuery,
} from "@mui/material";
import Header from "../components/Header";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
// import UpdateIcon from "@mui/icons-material/Update";
import SaveIcon from "@mui/icons-material/Save";
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
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const status = useSelector((state) => state.user.salariesStatus);
  const salaries = useSelector((state) => state.users.salaries).map(
    (salary, index) => ({ sequenceNumber: index + 1, ...salary })
  );
  const error = useSelector((state) => state.user.error);
  // const [startMonth, setStartMonth] = useState(new Date().getMonth());
  // const [startYear, setStartYear] = useState(new Date().getFullYear());
  // const [endMonth, setEndMonth] = useState(new Date().getMonth());
  // const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState({
    startMonth: new Date().getMonth(),
    startYear: new Date().getFullYear(),
  });
  const componentRef = useRef();
  const [rowModifications, setRowModifications] = useState({});
  const [editedRows, setEditedRows] = useState({});

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Employees Salary Report",
  });

  const handleDateChange = (field) => (event) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // const handleStartMonthChange = (event) => {
  //   setStartMonth(event.target.value);
  // };

  // const handleStartYearChange = (event) => {
  //   setStartYear(event.target.value);
  // };

  // const handleEndMonthChange = (event) => {
  //   setEndMonth(event.target.value);
  // };

  // const handleEndYearChange = (event) => {
  //   setEndYear(event.target.value);
  // };

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

  const processRowUpdate = (newRow, oldRow) => {
    const id = newRow._id;
    const changes = {};

    Object.keys(newRow).forEach((field) => {
      if (newRow[field] !== oldRow[field]) {
        changes[field] = newRow[field];
      }
    });

    if (Object.keys(changes).length > 0) {
      setRowModifications((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          ...changes,
        },
      }));

      setEditedRows((prev) => ({
        ...prev,
        [id]: true,
      }));
    }

    return newRow;
  };

  // Add error handler
  const handleProcessRowUpdateError = (error) => {
    console.error(error);
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
      headerName: t("no"),
      flex: 0.25,
      renderCell: (params) => {
        if (params.row._id === "sum-row") {
          return "";
        }
        // Get the current row's position in the grid
        const currentIndex = rowsWithSum.findIndex(
          (row) => row._id === params.row._id
        );
        return currentIndex + 1;
      },
      // Disable sorting for sequence column
      sortable: false,
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
      valueFormatter: (params) => Number(params.value || 0).toFixed(3),
    },
    {
      field: "additionalSalary",
      headerName: t("additionalSalary"),
      flex: 1,
      editable: true,
      type: Number,
      valueFormatter: (params) => Number(params.value || 0).toFixed(3),
    },
    {
      field: "companyDeductionAmount",
      headerName: t("companyDeductionAmount"),
      flex: 1,
      //editable: true, //Intentionally commented this as deductions should be done through deduction form only
      type: Number,
      valueFormatter: (params) => Number(params.value || 0).toFixed(3),
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
            {(
              Number(additionalSalary) +
              Number(mainSalary) -
              Number(companyDeductionAmount)
            ).toFixed(3)}
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
      type: String,
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
        const isSumRow = params.row._id === "sum-row";
        const rowId = params.row._id;
        const hasChanges = Boolean(
          editedRows[rowId] &&
            Object.keys(rowModifications[rowId] || {}).length > 0
        );
        return (
          <Box display="flex" gap={1}>
            {!isSumRow && (
              <Button
                color="secondary"
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={() => handleUpdate(params.row)}
                disabled={!hasChanges}
              >
                {t("save")}
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  const onSearchSubmit = async () => {
    const startDate = new Date(dateRange.startYear, dateRange.startMonth, 1);
    const endDate = new Date(dateRange.startYear, dateRange.startMonth + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    dispatch(
      fetchSalaries({
        startDate,
        endDate,
      })
    );
  };

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
      const modifications = rowModifications[row._id];

      if (!modifications || Object.keys(modifications).length === 0) {
        return;
      }

      // Get all the necessary values for the update
      const updateData = {
        additionalSalary:
          modifications.additionalSalary ?? row.additionalSalary,
        remarks: modifications.remarks ?? row.remarks,
        // Include any other fields that should be part of the update
        mainSalary: row.mainSalary,
        companyDeductionAmount: row.companyDeductionAmount,
      };

      // Dispatch the update with all values
      dispatch(
        updateAdditionalSalary({
          userId: row._id,
          values: updateData,
        })
      );

      // Clear modifications for this row
      setRowModifications((prev) => {
        const newState = { ...prev };
        delete newState[row._id];
        return newState;
      });

      setEditedRows((prev) => {
        const newState = { ...prev };
        delete newState[row._id];
        return newState;
      });
    } catch (error) {
      console.error("Error updating row:", error);
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
            value={dateRange.startMonth}
            onChange={handleDateChange("startMonth")}
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
          value={dateRange.startYear}
          onChange={handleDateChange("startYear")}
          sx={{ width: 100, mr: 2 }}
        />

        <Button
          onClick={onSearchSubmit}
          color="secondary"
          variant="contained"
          sx={{ mr: 2 }}
        >
          {t("search")}
        </Button>

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
          rows={rowsWithSum}
          columns={columns}
          getRowId={(row) => row._id}
          className={styles.grid}
          editMode="cell"
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          experimentalFeatures={{ newEditingApi: true }}
          getRowClassName={(params) =>
            params.row._id === "sum-row" ? `sum-row-highlight` : ""
          }
          sx={{
            "& .sum-row-highlight": {
              bgcolor: colors.greenAccent[700],
              fontWeight: "bold",
              fontSize: "1rem",
              "&:hover": {
                bgcolor: colors.greenAccent[600],
              },
              "& .MuiDataGrid-cell": {
                color: colors.grey[100],
              },
              borderBottom: `2px solid ${colors.grey[100]}`,
            },
          }}
        />

        <Box mt="20px" className={styles.notes}>
          <Box
            mt={4}
            p={3}
            bgcolor={colors.primary[400]}
            borderRadius="4px"
            display="grid"
            gap="30px"
            sx={{
              gridTemplateColumns: {
                xs: "1fr", // Single column on mobile
                sm: "repeat(2, 1fr)", // Two columns on tablet
                md: "repeat(1, 1fr)", // Four columns on desktop
              },
              "& > div": {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "20px",
                borderRadius: "8px",
              },
            }}
          >
            <Typography
              color={colors.greenAccent[500]}
              fontSize={24}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              {": "}
              {t("employeesTotalNetSalary")}
              <strong style={{ fontSize: "40px" }}>
                {netEmployeesSalaries}
                <span> {t("kd")} </span>
              </strong>
            </Typography>
          </Box>
        </Box>

        <PrintableTable
          rows={salaries}
          columns={columns}
          ref={componentRef}
          orientation="portrait"
          summary={{
            netEmployeesSalaries: netEmployeesSalaries,
          }}
        />
      </Box>
    </Box>
  );
};

export default EmployeesSalary;
