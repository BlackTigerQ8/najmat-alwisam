import React, { useEffect, useState } from "react";
import {
  Box,
  useTheme,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { tokens } from "../theme";
import { pulsar } from "ldrs";
import { useSelector, useDispatch } from "react-redux";
import { fetchBankStatement } from "../redux/bankStatementSlice";
import { ErrorMessage, Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";

const initialValues = {
  statementDate: "",
  deposits: 0,
  spends: 0,
  balance: 0,
  statementRemarks: "",
  checkNumber: "",
  statementDetails: "",
  bankAccountNumber: 8657,
};

const BankState = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [newBankStatement, setNetBankStatement] = useState([]);

  const dispatch = useDispatch();
  const bankStatement = useSelector(
    (state) => state.bankStatement.bankStatement
  );
  const status = useSelector((state) => state.bankStatement.status);
  const error = useSelector((state) => state.bankStatement.error);
  const token =
    useSelector((state) => state.bankStatement.token) ||
    localStorage.getItem("token");
  const [editRowsModel, setEditRowsModel] = useState({});
  const [initialBalance, setInitialBalance] = useState(140);

  const columns = [
    {
      field: "statementDate",
      headerName: "Date",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "deposits",
      headerName: "Deposits",
      flex: 1,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "spends",
      headerName: "Spends",
      flex: 1,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "balance",
      headerName: "Balance",
      flex: 1,
      headerAlign: "center",
      align: "center",
      editable: true,
      // Render input field for the first row of balance column
      renderCell: (params) =>
        params.rowIndex === 0 ? (
          <input
            type="number"
            value={initialBalance}
            onChange={(e) => setInitialBalance(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        ) : (
          <Typography variant="body1">{params.value}</Typography>
        ),
    },
    {
      field: "statementRemarks",
      headerName: "Remarks",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "checkNumber",
      headerName: "Check Number",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "statementDetails",
      headerName: "Details",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
  ];

  useEffect(() => {
    dispatch(fetchBankStatement(token));
  }, [token]);

  const handleSubmit = async (values, { resetForm }) => {
    const newRow = {
      _id: bankStatement.length + 1,
      ...values,
    };
    newBankStatement([...bankStatement, newRow]);
    resetForm();
  };

  const handleCellValueChange = (params) => {
    const { id, field, value } = params;
    const updatedStatement = bankStatement.map((row) =>
      row._id === id ? { ...row, [field]: value } : row
    );
    setEditRowsModel(updatedStatement);
  };

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

  return (
    <Box m="20px">
      <Header title="BANK STATEMENT" subtitle="Bank Statement Page" />
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
        {/* <Box mb="20px">
          <Header subtitle="Select Bank Account Number" />
          <Formik onSubmit={handleSubmit} initialValues={initialValues}>
            {({ values, errors, touched, handleBlur, handleChange }) => (
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": {
                    gridColumn: isNonMobile ? undefined : "span 4",
                  },
                }}
              >
                <FormControl
                  fullWidth
                  variant="filled"
                  sx={{ gridColumn: "span 2" }}
                >
                  <InputLabel htmlFor="bankAccountNumber">
                    Bank Account Number
                  </InputLabel>
                  <Select
                    label="bankAccountNumber"
                    value={values.bankAccountNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="bankAccountNumber"
                    error={
                      !!touched.bankAccountNumber && !!errors.bankAccountNumber
                    }
                    helperText={
                      touched.bankAccountNumber && errors.bankAccountNumber
                    }
                  >
                    <MenuItem value={"8657"}>8657</MenuItem>
                    <MenuItem value={"8656"}>8656</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Formik>
        </Box> */}

        <Box mb="20px">
          <Header subtitle="ADD NEW ROW" />
          <Formik onSubmit={handleSubmit} initialValues={initialValues}>
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
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  <TextField
                    fullWidth
                    variant="filled"
                    type="date"
                    label="Date"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.statementDate}
                    name="statementDate"
                    error={!!touched.statementDate && !!errors.statementDate}
                    helperText={touched.statementDate && errors.statementDate}
                    sx={{ gridColumn: "span 1" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="number"
                    label="Deposits"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.deposits}
                    name="deposits"
                    error={!!touched.deposits && !!errors.deposits}
                    helperText={touched.deposits && errors.deposits}
                    sx={{ gridColumn: "span 1" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="number"
                    label="Spends"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.spends}
                    name="spends"
                    error={!!touched.spends && !!errors.spends}
                    helperText={touched.spends && errors.spends}
                    sx={{ gridColumn: "span 1" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="number"
                    label="Balance"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.balance}
                    name="balance"
                    error={!!touched.balance && !!errors.balance}
                    helperText={touched.balance && errors.balance}
                    sx={{ gridColumn: "span 1" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Remarks"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.statementRemarks}
                    name="statementRemarks"
                    error={
                      !!touched.statementRemarks && !!errors.statementRemarks
                    }
                    helperText={
                      touched.statementRemarks && errors.statementRemarks
                    }
                    sx={{ gridColumn: "span 1" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Check Number"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.checkNumber}
                    name="checkNumber"
                    error={!!touched.checkNumber && !!errors.checkNumber}
                    helperText={touched.checkNumber && errors.checkNumber}
                    sx={{ gridColumn: "span 1" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Details"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.statementDetails}
                    name="statementDetails"
                    error={
                      !!touched.statementDetails && !!errors.statementDetails
                    }
                    helperText={
                      touched.statementDetails && errors.statementDetails
                    }
                    sx={{ gridColumn: "span 1" }}
                  />
                </Box>
                <Box display="flex" justifyContent="end" mt="20px">
                  <Button type="submit" color="secondary" variant="contained">
                    Add New Row
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Box>

        <Box mb="20px">
          <Formik onSubmit={handleSubmit} initialValues={initialValues}>
            {({ values, errors, touched, handleBlur, handleChange }) => (
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": {
                    gridColumn: isNonMobile ? undefined : "span 4",
                  },
                }}
              >
                <FormControl
                  fullWidth
                  variant="filled"
                  sx={{ gridColumn: "span 2" }}
                >
                  <InputLabel htmlFor="bankAccountNumber">
                    Bank Account Number
                  </InputLabel>
                  <Select
                    label="bankAccountNumber"
                    value={values.bankAccountNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="bankAccountNumber"
                    error={
                      !!touched.bankAccountNumber && !!errors.bankAccountNumber
                    }
                    helperText={
                      touched.bankAccountNumber && errors.bankAccountNumber
                    }
                  >
                    <MenuItem value={"8657"}>8657</MenuItem>
                    <MenuItem value={"8656"}>8656</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  variant="filled"
                  type="date"
                  label="Starting Date"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.statementDate}
                  name="statementDate"
                  error={!!touched.statementDate && !!errors.statementDate}
                  helperText={touched.statementDate && errors.statementDate}
                  sx={{ gridColumn: "span 1" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="date"
                  label="Ending Date"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.statementDate}
                  name="statementDate"
                  error={!!touched.statementDate && !!errors.statementDate}
                  helperText={touched.statementDate && errors.statementDate}
                  sx={{ gridColumn: "span 1" }}
                />
              </Box>
            )}
          </Formik>
        </Box>
        <DataGrid
          rows={bankStatement}
          columns={columns}
          getRowId={(row) => row._id}
          editRowsModel={editRowsModel}
          onEditCellChange={handleCellValueChange}
        />
      </Box>
    </Box>
  );
};

export default BankState;
