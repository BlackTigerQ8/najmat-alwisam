import React, {useRef, useEffect,useState } from "react";
import { Box, Button, useTheme,TextField,FormControl,InputLabel,Select,MenuItem } from "@mui/material";
import Header from "../components/Header";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import UpdateIcon from "@mui/icons-material/Update";
import { pulsar } from "ldrs";
import { useSelector, useDispatch } from "react-redux";
import { fetchSalaries, updateAdditionalSalary } from "../redux/usersSlice";
import { startOfMonth, endOfMonth } from "date-fns";
import { PrintLogo } from "./PrintLogo";
import { useReactToPrint } from 'react-to-print';



const EmployeesSalary = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const status = useSelector((state) => state.user.salariesStatus);
  const salaries = useSelector((state) => state.users.salaries);
  const error = useSelector((state) => state.user.error);
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth());
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Employees Salary Report',
  });

  console.log('startMonth=', startMonth, ', startYear=', startYear)
  console.log('endMonth=', endMonth, ', endYear=', endYear)
  
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

  

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "NO.",
      flex: 0.25,
    },
    {
      field: "name",
      headerName: "Name",
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
      headerName: "Main Salary",
      flex: 0.75,
      type: Number,
      editable: false,
    },
    {
      field: "additionalSalary",
      headerName: "Additional Salary",
      flex: 1,
      editable: true,
      type: Number,
    },
    {
      field: "companyDeductionAmount",
      headerName: "Company Deduction",
      flex: 1,
      //editable: true, //Intentionally commented this as deductions should be done through deduction form only
      type: Number,
    },
    {
      field: "totalSalary",
      headerName: "Net Salary",
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
      headerName: "Deduction Reason",
      flex: 1,
      //editable: true, //Intentionally commented this as deductions should be done through deduction form only
      type: String,
    },
    {
      field: "remarks",
      headerName: "Remarks",
      flex: 1,
      editable: true,
    },

    {
      field: "actions",
      headerName: "Actions",
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
    dispatch(fetchSalaries({ startDate: startOfMonth(new Date(startYear, startMonth)), endDate: endOfMonth(new Date(endYear, endMonth)) })),
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
      <Header title="EMPLOYEES SALARY" subtitle="Employees Salary Page" />
      <Box display="flex" justifyContent="flex-end" mb={2}>
      <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>Start Month</InputLabel>
          <Select value={startMonth} onChange={handleStartMonthChange} label="Start Month">
            {[...Array(12).keys()].map((month) => (
              <MenuItem key={month} value={month}>
                {new Date(0, month).toLocaleString("default", { month: "long" })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          type="number"
          label="Start Year"
          value={startYear}
          onChange={handleStartYearChange}
          sx={{ width: 100, mr: 2 }}
        />
         <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>End Month</InputLabel>
          <Select value={endMonth} onChange={handleEndMonthChange} label="End Month">
            {[...Array(12).keys()].map((month) => (
              <MenuItem key={month} value={month}>
                {new Date(0, month).toLocaleString("default", { month: "long" })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          type="number"
          label="End Year"
          value={endYear}
          onChange={handleEndYearChange}
          sx={{ width: 100 }}
        />
         <Box display="flex" sx={{ gridColumn: "span 1" }}>
              <Button onClick={onSearchSubmit} color="secondary" variant="contained">
                Search
              </Button>
            </Box>
            <Box display="flex" sx={{ gridColumn: "span 1" }}>
        <Button onClick={handlePrint} color="primary" variant="contained">
          Print
        </Button>
      </Box>
      </Box>
      <Box
       ref={componentRef}
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

        <PrintLogo />
        <DataGrid
          rows={Array.isArray(salaries) ? salaries : []}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default EmployeesSalary;
