import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import * as yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import {
  createBankStatement,
  fetchBankStatement,
  searchBankStatement,
} from "../redux/bankStatementSlice";
import { Formik } from "formik";
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

const searchInitialValues = {
  bankAccountNumber: 8657,
  startDate: "",
  endDate: "",
};

const searchSchema = yup.object().shape({
  startDate: yup.string().required("Select starting date"),
  endDate: yup.string().required("Select ending date"),
});
const rowSchema = yup.object().shape({
  statementDate: yup.string().required("Select a date"),
});

const BankState = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const dispatch = useDispatch();
  const bankStatement = useSelector(
    (state) => state.bankStatement.bankStatement
  );
  const pageStatus = useSelector((state) => state.bankStatement.status);
  const searchStatus = useSelector((state) => state.bankStatement.searchStatus);

  const searchResults = useSelector(
    (state) => state.bankStatement.searchResults
  );

  const status = searchStatus || pageStatus;
  const error = useSelector((state) => state.bankStatement.error);
  const token =
    useSelector((state) => state.bankStatement.token) ||
    localStorage.getItem("token");
  const [editRowsModel, setEditRowsModel] = useState({});

  const getStatementsByAccountNumber = useCallback(
    (selectedAccountNumber) =>
      bankStatement.filter(
        (b) => b.bankAccountNumber === selectedAccountNumber
      ),
    [bankStatement]
  );

  const totalSpends = useMemo(() => {
    if (searchStatus) {
      return searchResults.reduce((total, statement) => {
        return total + Number(statement.spends);
      }, 0);
    }

    return bankStatement.reduce((total, statement) => {
      return total + Number(statement.spends);
    }, 0);
  }, [searchStatus, bankStatement, searchResults]);

  const totalDeposits = useMemo(() => {
    if (searchStatus) {
      return searchResults.reduce((total, statement) => {
        return total + Number(statement.deposits);
      }, 0);
    }

    return bankStatement.reduce((total, statement) => {
      return total + Number(statement.deposits);
    }, 0);
  }, [searchStatus, bankStatement, searchResults]);

  console.log("totalSpends", totalSpends);

  const columns = [
    {
      field: "statementDate",
      headerName: "Date",
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => {
        const date = new Date(params.value);
        const formattedDate = `${date.getDate()}/${
          date.getMonth() + 1
        }/${date.getFullYear()}`;
        return formattedDate;
      },
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
    dispatch(createBankStatement({ values }));
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
        <Box mb="20px">
          <Header subtitle="ADD NEW ROW" />
          <Formik
            onSubmit={handleSubmit}
            initialValues={initialValues}
            validationSchema={rowSchema}
          >
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
                  <FormControl
                    fullWidth
                    variant="filled"
                    sx={{ gridColumn: "span 1" }}
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
                        !!touched.bankAccountNumber &&
                        !!errors.bankAccountNumber
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
                    disabled={
                      !getStatementsByAccountNumber(values.bankAccountNumber)
                        .length
                    }
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
                    disabled={
                      !getStatementsByAccountNumber(values.bankAccountNumber)
                        .length
                    }
                  />
                  {!getStatementsByAccountNumber(values.bankAccountNumber)
                    .length && (
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
                  )}
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
          <BankStatementSearchForm isNonMobile={isNonMobile} />
        </Box>
        <DataGrid
          rows={searchStatus ? searchResults : bankStatement}
          columns={columns}
          getRowId={(row) => row._id}
          editRowsModel={editRowsModel}
          onEditCellChange={handleCellValueChange}
        />
        <Typography variant="h4" color="secondary" mt={4}>
          Total spends:
          <strong>
            <span> {totalSpends / 1000} </span> KD
          </strong>
        </Typography>
        <Typography variant="h4" color="secondary" mt={4}>
          Total deposits:
          <strong>
            <span> {totalDeposits / 1000} </span> KD
          </strong>
        </Typography>
      </Box>
    </Box>
  );
};

export function BankStatementSearchForm({ isNonMobile }) {
  const dispatch = useDispatch();

  const onSearchSubmit = async (values) => [
    dispatch(searchBankStatement({ values })),
  ];

  return (
    <Formik
      onSubmit={onSearchSubmit}
      initialValues={searchInitialValues}
      validationSchema={searchSchema}
    >
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
            <FormControl
              fullWidth
              variant="filled"
              sx={{ gridColumn: "span 1.8" }}
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
            <Box display="flex" sx={{ gridColumn: "span 1" }}>
              <Button type="submit" color="secondary" variant="contained">
                Search
              </Button>
            </Box>
          </Box>
        </form>
      )}
    </Formik>
  );
}

export default BankState;
