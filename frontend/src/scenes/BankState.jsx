import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  DialogContentText,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
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
  updateBankStatement,
  deleteBankStatement,
} from "../redux/bankStatementSlice";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import PrintableTable from "./PrintableTable";
import { useReactToPrint } from "react-to-print";
import styles from "./Print.module.css";
import { useTranslation } from "react-i18next";

const initialValues = {
  statementDate: "",
  deposits: 0,
  spends: 0,
  balance: 0,
  statementRemarks: "",
  checkNumber: "",
  statementDetails: "",
  bankAccountNumber: 11010718657,
};

const searchInitialValues = {
  bankAccountNumber: 11010718657,
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
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Bank statement Report",
  });

  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();

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

  const [rows, setRows] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  const [rowModifications, setRowModifications] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(11010718657);

  const getStatementsByAccountNumber = useCallback(
    (selectedAccountNumber) => {
      return bankStatement.filter(
        (b) => b.bankAccountNumber == selectedAccountNumber
      );
    },
    [bankStatement]
  );

  // Filter rows based on selected account
  useEffect(() => {
    const filteredRows = searchStatus
      ? searchResults.filter((row) => row.bankAccountNumber === selectedAccount)
      : bankStatement.filter(
          (row) => row.bankAccountNumber === selectedAccount
        );
    setRows(filteredRows);
  }, [searchStatus, bankStatement, searchResults, selectedAccount]);

  // Account switching buttons above the table
  const renderAccountSwitcher = () => (
    <Box
      mb={2}
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent={{ sm: "space-between" }}
      gap={2}
    >
      {/* Account Buttons */}
      <Box display="flex" gap={2}>
        <Button
          variant={selectedAccount === 11010718657 ? "contained" : "outlined"}
          color="secondary"
          sx={{
            flex: { xs: 1, sm: "auto" },
            height: "50px",
          }}
          onClick={() => setSelectedAccount(11010718657)}
        >
          {t("expensesAccount")}
        </Button>
        <Button
          variant={selectedAccount === 61010108361 ? "contained" : "outlined"}
          color="secondary"
          sx={{
            flex: { xs: 1, sm: "auto" },
            height: "50px",
          }}
          onClick={() => setSelectedAccount(61010108361)}
        >
          {t("profitsAccount")}
        </Button>
      </Box>

      {/* Print Button */}
      <Button
        onClick={handlePrint}
        color="primary"
        variant="contained"
        sx={{
          width: { xs: "100%", sm: "120px" },
          height: "50px",
          "&:hover": { backgroundColor: colors.blueAccent[600] },
        }}
      >
        {t("print")}
      </Button>
    </Box>
  );

  useEffect(() => {
    // Update rows whenever bankStatement or searchResults change
    setRows(searchStatus ? searchResults : bankStatement);
  }, [searchStatus, bankStatement, searchResults]);

  const profitsAccountTotals = useMemo(() => {
    const profitsData = searchStatus
      ? searchResults.filter((row) => row.bankAccountNumber === 61010108361)
      : bankStatement.filter((row) => row.bankAccountNumber === 61010108361);

    const totalDeposits = profitsData.reduce((total, statement) => {
      return total + Number(statement.deposits);
    }, 0);

    const totalSpends = profitsData.reduce((total, statement) => {
      return total + Number(statement.spends);
    }, 0);

    return {
      deposits: totalDeposits,
      spends: totalSpends,
      balance: totalDeposits - totalSpends,
    };
  }, [searchStatus, bankStatement, searchResults]);

  const expensesAccountTotals = useMemo(() => {
    const expensesData = searchStatus
      ? searchResults.filter((row) => row.bankAccountNumber === 11010718657)
      : bankStatement.filter((row) => row.bankAccountNumber === 11010718657);

    const totalDeposits = expensesData.reduce((total, statement) => {
      return total + Number(statement.deposits);
    }, 0);

    const totalSpends = expensesData.reduce((total, statement) => {
      return total + Number(statement.spends);
    }, 0);

    return {
      deposits: totalDeposits,
      spends: totalSpends,
      balance: totalDeposits - totalSpends,
    };
  }, [searchStatus, bankStatement, searchResults]);

  /////////////////////////////

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

  const totalBalance = useMemo(() => {
    return totalDeposits - totalSpends;
  }, [totalDeposits, totalSpends]);

  const formatNegativeNumber = (value) => {
    const num = Number(value);
    if (num < 0) {
      return (
        <span style={{ color: "red", fontSize: "1.2em", fontWeight: "bold" }}>
          ({num.toLocaleString()})
        </span>
      );
    }
    return num.toLocaleString();
  };
  const handleRowUpdate = async (id) => {
    try {
      const modifications = rowModifications[id];

      if (!modifications || Object.keys(modifications).length === 0) {
        return;
      }

      const formattedModifications = { ...modifications };

      // ... your existing formatting logic ...

      await dispatch(
        updateBankStatement({
          id,
          updates: formattedModifications,
        })
      ).unwrap();

      setEditedRows((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });

      setRowModifications((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });

      // Update the rows state with the server response
      await dispatch(fetchBankStatement());
    } catch (error) {
      // If save fails, revert the UI to the original state
      setRows(searchStatus ? searchResults : bankStatement);
      console.log(error);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteBankStatement(deleteId)).unwrap();
      await dispatch(fetchBankStatement());
    } catch (error) {
      console.error("Failed to delete bank statement:", error);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
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
      // Store changes for save operation
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

      // Immediately update the UI
      setRows((prevRows) =>
        prevRows.map((row) => (row._id === id ? { ...row, ...changes } : row))
      );
    }

    return newRow;
  };

  // Add calculateColumnSum helper function
  const calculateColumnSum = (fieldName) => {
    const data = searchStatus ? searchResults : bankStatement;
    return data.reduce((total, statement) => {
      return total + Number(statement[fieldName] || 0);
    }, 0);
  };

  const rowsWithSum = useMemo(() => {
    const filteredRows = searchStatus
      ? searchResults.filter((row) => row.bankAccountNumber === selectedAccount)
      : bankStatement.filter(
          (row) => row.bankAccountNumber === selectedAccount
        );

    const sumRow = {
      _id: "sum-row",
      sequence: "",
      statementDate: "",
      deposits: filteredRows.reduce(
        (sum, row) => sum + Number(row.deposits || 0),
        0
      ),
      spends: filteredRows.reduce(
        (sum, row) => sum + Number(row.spends || 0),
        0
      ),
      balance: filteredRows.reduce(
        (sum, row) => sum + Number(row.deposits || 0) - Number(row.spends || 0),
        0
      ),
      statementRemarks: "",
      checkNumber: null,
      statementDetails: "",
      actions: "",
    };

    return [...rows, sumRow];
  }, [rows, selectedAccount, searchStatus, searchResults, bankStatement]);

  const columns = [
    {
      field: "sequence",
      headerName: t("no"),
      editable: false,
      flex: 0.5,
      renderCell: (params) => {
        if (params.row._id === "sum-row") {
          return "";
        }
        const currentIndex = rowsWithSum.findIndex(
          (row) => row._id === params.row._id
        );
        return currentIndex + 1;
      },
      sortable: false,
    },
    {
      field: "statementDate",
      headerName: t("date"),
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      editable: (params) => params.row._id !== "sum-row",
      renderCell: (params) => {
        // Check for sum row
        if (params.row._id === "sum-row") {
          return t("total");
        }
        // Handle regular date formatting
        if (params.value) {
          const date = new Date(params.value);
          if (!isNaN(date.getTime())) {
            // Check if date is valid
            return `${date.getDate()}/${
              date.getMonth() + 1
            }/${date.getFullYear()}`;
          }
        }
        return params.value;
      },
      renderEditCell: (params) => (
        <TextField
          fullWidth
          variant="filled"
          type="date"
          value={params.value?.split("T")[0] || ""}
          onChange={(e) =>
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: e.target.value,
            })
          }
          sx={{ width: "100%" }}
          InputLabelProps={{ shrink: true }}
        />
      ),
    },
    {
      field: "deposits",
      headerName: t("deposits"),
      flex: 0.5,
      headerAlign: "center",
      align: "center",
      editable: true,
      type: "number",
      renderCell: (params) => formatNegativeNumber(params.value),
    },
    {
      field: "spends",
      headerName: t("withdrawals"),
      flex: 0.5,
      headerAlign: "center",
      align: "center",
      editable: true,
      type: "number",
      renderCell: (params) => formatNegativeNumber(params.value),
    },
    {
      field: "balance",
      headerName: t("balance"),
      flex: 0.5,
      headerAlign: "center",
      align: "center",
      type: "number",
      renderCell: (params) => formatNegativeNumber(params.value),
    },
    {
      field: "statementRemarks",
      headerName: t("remarks"),
      flex: 1.2,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "checkNumber",
      headerName: t("checkNumber"),
      flex: 0.5,
      headerAlign: "center",
      align: "center",
      editable: true,
      type: "number",
    },
    {
      field: "statementDetails",
      headerName: t("details"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "actions",
      headerName: t("actions"),
      headerAlign: "center",
      flex: 1.3,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const rowId = params.row._id;
        const isSumRow = rowId === "sum-row";
        if (isSumRow) return null;

        const hasChanges = Boolean(
          editedRows[rowId] && rowModifications[rowId]
        );

        return (
          <Box display="flex" gap={1}>
            <Button
              color="secondary"
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={() => handleRowUpdate(rowId)}
              disabled={!hasChanges}
            >
              {t("save")}
            </Button>
            <Button
              color="error"
              variant="contained"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteClick(rowId)}
            >
              {t("delete")}
            </Button>
          </Box>
        );
      },
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
      <Header
        title={t("bankStatementTitle")}
        subtitle={t("bankStatementSubtitle")}
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
        <Box mb="20px">
          <Header subtitle={t("addNewRow")} />
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
                      {t("bankAccountNumber")}
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
                      <MenuItem value={61010108361}>حساب الأرباح</MenuItem>
                      <MenuItem value={11010718657}>حساب المصاريف</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="date"
                    label={t("date")}
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
                    label={t("deposits")}
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
                    label={t("withdrawals")}
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
                      label={t("balance")}
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
                    label={t("remarks")}
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
                    label={t("checkNumber")}
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
                    label={t("details")}
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
                  <Button
                    type="submit"
                    color="secondary"
                    variant="contained"
                    sx={{
                      gridColumn: isNonMobile ? "span 1" : "span 4",
                      width: "100%",
                      height: "50px",
                    }}
                  >
                    {t("addNewRow")}
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Box>

        {/* <Box mb="20px">
          <BankStatementSearchForm
            isNonMobile={isNonMobile}
            handlePrint={handlePrint}
          />
        </Box> */}

        {renderAccountSwitcher()}

        <Box mt="40px" height="75vh">
          <DataGrid
            rows={rowsWithSum}
            columns={columns}
            getRowId={(row) => row._id}
            editRowsModel={editRowsModel}
            onEditCellChange={handleCellValueChange}
            className={styles.grid}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={(error) => console.log(error)}
            getRowClassName={(params) =>
              params.row._id === "sum-row" ? `sum-row-highlight` : ""
            }
            sx={{
              "& .sum-row-highlight": {
                bgcolor: colors.blueAccent[700],
                "&:hover": {
                  bgcolor: colors.blueAccent[600],
                },
              },
            }}
          />
          <PrintableTable
            rows={searchStatus ? searchResults : bankStatement}
            columns={columns}
            ref={componentRef}
            orientation="landscape"
            page="bankStatement"
            summary={{
              totalDeposits: formatNegativeNumber(totalDeposits),
              totalSpends: formatNegativeNumber(totalSpends),
              totalBalance: formatNegativeNumber(totalBalance),
            }}
          />
          {/* Summary Section */}
          <Box mt="20px" className={styles.notes}>
            {/* Expenses Account Summary */}
            <Typography
              variant="h5"
              color="secondary"
              mb={2}
              sx={{ textAlign: "center" }}
            >
              {t("expensesAccount")}
            </Typography>
            <Box
              mt={4}
              p={3}
              bgcolor={colors.primary[400]}
              borderRadius="4px"
              display="grid"
              gap="30px"
              sx={{
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(3, 1fr)",
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
              <Box>
                <Typography
                  variant="subtitle2"
                  color={colors.grey[100]}
                  mb={1}
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    fontWeight: "bold",
                  }}
                >
                  {t("totalWithdrawals")}
                </Typography>
                <Typography
                  variant="h4"
                  color="secondary"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                  }}
                >
                  {formatNegativeNumber(expensesAccountTotals.spends)}
                  <span style={{ fontSize: "1em" }}> KD</span>
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color={colors.grey[100]}
                  mb={1}
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    fontWeight: "bold",
                  }}
                >
                  {t("totalDeposits")}
                </Typography>
                <Typography
                  variant="h4"
                  color="secondary"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                  }}
                >
                  {formatNegativeNumber(expensesAccountTotals.deposits)}
                  <span style={{ fontSize: "1em" }}> KD</span>
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color={colors.grey[100]}
                  mb={1}
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    fontWeight: "bold",
                  }}
                >
                  {t("currentBalance")}
                </Typography>
                <Typography
                  variant="h4"
                  color="secondary"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                  }}
                >
                  {formatNegativeNumber(expensesAccountTotals.balance)}
                  <span style={{ fontSize: "1em" }}> KD</span>
                </Typography>
              </Box>
            </Box>
            {/* Profits Account Summary */}
            <Typography
              variant="h5"
              color="secondary"
              mb={2}
              mt={4}
              sx={{ textAlign: "center" }}
            >
              {t("profitsAccount")}
            </Typography>
            <Box
              mt={4}
              p={3}
              bgcolor={colors.primary[400]}
              borderRadius="4px"
              display="grid"
              gap="30px"
              sx={{
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(3, 1fr)",
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
              <Box>
                <Typography
                  variant="subtitle2"
                  color={colors.grey[100]}
                  mb={1}
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    fontWeight: "bold",
                  }}
                >
                  {t("totalWithdrawals")}
                </Typography>
                <Typography
                  variant="h4"
                  color="secondary"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                  }}
                >
                  {formatNegativeNumber(profitsAccountTotals.spends)}
                  <span style={{ fontSize: "1em" }}> KD</span>
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color={colors.grey[100]}
                  mb={1}
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    fontWeight: "bold",
                  }}
                >
                  {t("totalDeposits")}
                </Typography>
                <Typography
                  variant="h4"
                  color="secondary"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                  }}
                >
                  {formatNegativeNumber(profitsAccountTotals.deposits)}
                  <span style={{ fontSize: "1em" }}> KD</span>
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color={colors.grey[100]}
                  mb={1}
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    fontWeight: "bold",
                  }}
                >
                  {t("currentBalance")}
                </Typography>
                <Typography
                  variant="h4"
                  color="secondary"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                  }}
                >
                  {formatNegativeNumber(profitsAccountTotals.balance)}
                  <span style={{ fontSize: "1em" }}> KD</span>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t("confirmDeleteBankStatementTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t("confirmDeleteBankStatementMessage")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            {t("cancel")}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// export function BankStatementSearchForm({ isNonMobile, handlePrint }) {
//   const dispatch = useDispatch();
//   const { t } = useTranslation();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const onSearchSubmit = async (values) => [
//     dispatch(searchBankStatement({ values })),
//   ];

//   return (
//     <Formik
//       onSubmit={onSearchSubmit}
//       initialValues={searchInitialValues}
//       validationSchema={searchSchema}
//     >
//       {({
//         values,
//         errors,
//         touched,
//         handleBlur,
//         handleChange,
//         handleSubmit,
//       }) => (
//         <form onSubmit={handleSubmit}>
//           <Box
//             display="grid"
//             gap="30px"
//             gridTemplateColumns="repeat(5, minmax(0, 1fr))"
//             sx={{
//               "& > div": {
//                 gridColumn: isNonMobile ? undefined : "span 5",
//               },
//             }}
//           >
//             <FormControl
//               fullWidth
//               variant="filled"
//               sx={{ gridColumn: "span 1.8" }}
//             >
//               <InputLabel htmlFor="bankAccountNumber">
//                 Bank Account Number
//               </InputLabel>
//               <Select
//                 label="bankAccountNumber"
//                 value={values.bankAccountNumber}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 name="bankAccountNumber"
//                 error={
//                   !!touched.bankAccountNumber && !!errors.bankAccountNumber
//                 }
//                 helperText={
//                   touched.bankAccountNumber && errors.bankAccountNumber
//                 }
//               >
//                 <MenuItem value={61010108361}>حساب الأرباح</MenuItem>
//                 <MenuItem value={11010718657}>حساب المصاريف</MenuItem>
//               </Select>
//             </FormControl>
//             <TextField
//               fullWidth
//               variant="filled"
//               type="date"
//               label={t("startingDate")}
//               onBlur={handleBlur}
//               onChange={handleChange}
//               value={values.startDate}
//               name="startDate"
//               error={!!touched.startDate && !!errors.startDate}
//               helperText={touched.startDate && errors.startDate}
//               sx={{ gridColumn: "span 1" }}
//             />
//             <TextField
//               fullWidth
//               variant="filled"
//               type="date"
//               label={t("endingDate")}
//               onBlur={handleBlur}
//               onChange={handleChange}
//               value={values.endDate}
//               name="endDate"
//               error={!!touched.endDate && !!errors.endDate}
//               helperText={touched.endDate && errors.endDate}
//               sx={{ gridColumn: "span 1" }}
//             />
//             <Box
//               display="flex"
//               gap="20px"
//               sx={{
//                 gridColumn: "span 2",
//                 justifyContent: "flex-end",
//                 alignItems: "center",
//               }}
//             >
//               <Button
//                 type="submit"
//                 color="secondary"
//                 variant="contained"
//                 sx={{
//                   width: "120px",
//                   height: "50px",
//                   "&:hover": { backgroundColor: colors.greenAccent[600] },
//                 }}
//               >
//                 {t("saveData")}
//               </Button>
//               <Button
//                 onClick={handlePrint}
//                 color="primary"
//                 variant="contained"
//                 sx={{
//                   width: "120px",
//                   height: "50px",
//                   "&:hover": { backgroundColor: colors.blueAccent[600] },
//                 }}
//               >
//                 {t("print")}
//               </Button>
//             </Box>
//           </Box>
//         </form>
//       )}
//     </Formik>
//   );
// }

export default BankState;
