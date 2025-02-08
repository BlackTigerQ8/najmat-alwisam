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
  FormHelperText,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
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
  createNewBankAccount,
  updateBankStatement,
  deleteBankStatement,
  fetchBankAccounts,
} from "../redux/bankStatementSlice";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import PrintableTable from "./PrintableTable";
import { useReactToPrint } from "react-to-print";
import styles from "./Print.module.css";
import { useTranslation } from "react-i18next";

const rowSchema = yup.object().shape({
  statementDate: yup.string().required("Select a date"),
});

// Create new account
const CreateNewAccountDialog = ({
  open,
  onClose,
  onSubmit,
  availableAccounts,
}) => {
  const { t } = useTranslation();

  const newAccountSchema = yup.object().shape({
    accountNumber: yup
      .string()
      .required(t("accountNumberRequired"))
      .test(
        "unique-account-number",
        t("accountNumberExists"),
        function (value) {
          if (!value) return true; // Skip validation if no value

          // Check if account number exists in availableAccounts
          return !availableAccounts?.some(
            (account) => account.accountNumber === Number(value)
          );
        }
      ),
    accountName: yup
      .string()
      .required(t("accountNameRequired"))
      .test("unique-account-name", t("accountNameExists"), function (value) {
        if (!value) return true; // Skip validation if no value

        // Check if account name exists in availableAccounts (case insensitive)
        return !availableAccounts?.some(
          (account) =>
            account.accountName.toLowerCase() === value?.toLowerCase()
        );
      }),
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("createNewBankAccount")}</DialogTitle>
      <Formik
        initialValues={{
          accountNumber: "",
          accountName: "",
        }}
        validationSchema={newAccountSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            await onSubmit(values);
            resetForm();
            onClose();
          } catch (error) {
            console.error("Failed to create account:", error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Box
                sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  fullWidth
                  label={t("accountNumber")}
                  name="accountNumber"
                  value={values.accountNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.accountNumber && Boolean(errors.accountNumber)}
                  helperText={touched.accountNumber && errors.accountNumber}
                  type="number"
                />
                <TextField
                  fullWidth
                  label={t("accountName")}
                  name="accountName"
                  value={values.accountName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.accountName && Boolean(errors.accountName)}
                  helperText={touched.accountName && errors.accountName}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>{t("cancel")}</Button>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={isSubmitting}
              >
                {t("create")}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
};

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
  const bankAccounts = useSelector((state) => state.bankStatement.bankAccounts);

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
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newAccountDialogOpen, setNewAccountDialogOpen] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState({
    expensesAccount: null,
    profitsAccount: null,
  });

  // Get default account number
  const defaultAccountNumber = useMemo(() => {
    if (!bankAccounts?.length) return "";

    // Convert environment variable to number for comparison
    const expensesAccountNumber = Number(
      process.env.REACT_APP_EXPENSES_ACCOUNT_NUMBER
    );

    const expensesAccount = bankAccounts.find(
      (acc) => acc.accountNumber === expensesAccountNumber
    );

    return expensesAccount ? expensesAccount.accountNumber : "";
  }, [bankAccounts]);

  const initialValues = useMemo(
    () => ({
      statementDate: "",
      deposits: 0,
      spends: 0,
      balance: 0,
      statementRemarks: "",
      checkNumber: "",
      statementDetails: "",
      bankAccountNumber: defaultAccountNumber,
      bankAccounts: [],
    }),
    [accountTypes.expensesAccount]
  );

  const searchInitialValues = useMemo(
    () => ({
      bankAccountNumber: selectedAccount || "",
      startDate: "",
      endDate: "",
    }),
    [selectedAccount]
  );

  // Fetch bank accounts when component mounts
  useEffect(() => {
    dispatch(fetchBankAccounts());
  }, [dispatch]);

  // Update availableAccounts when bankAccounts changes
  useEffect(() => {
    if (bankAccounts && bankAccounts.length > 0) {
      setAvailableAccounts(bankAccounts);

      // Set default selected account (Expenses Account) if none selected
      if (!selectedAccount) {
        const expensesAccount = bankAccounts.find((acc) =>
          acc.accountName.toLowerCase().includes("expenses")
        );
        if (expensesAccount) {
          setSelectedAccount(expensesAccount.accountNumber);
        }
      }
    }
  }, [bankAccounts, selectedAccount]);

  // Filter data based on selected account
  const filteredData = useMemo(() => {
    if (!selectedAccount) return [];

    return searchStatus
      ? searchResults.filter((row) => row.bankAccountNumber === selectedAccount)
      : bankStatement.filter(
          (row) => row.bankAccountNumber === selectedAccount
        );
  }, [searchStatus, searchResults, bankStatement, selectedAccount]);

  const getStatementsByAccountNumber = useCallback(
    (selectedAccountNumber) => {
      return bankStatement.filter(
        (b) => b.bankAccountNumber === selectedAccountNumber
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

  const handleCreateNewAccount = async (formData) => {
    try {
      await dispatch(
        createNewBankAccount({
          accountNumber: Number(formData.accountNumber),
          accountName: formData.accountName,
        })
      ).unwrap();

      // After creating account, fetch all accounts again
      await dispatch(fetchBankAccounts());

      // Close dialog on success
      setNewAccountDialogOpen(false);

      // Refresh bank statement data
      await dispatch(fetchBankStatement());
    } catch (error) {
      console.error("Failed to create bank account:", error);
    }
  };

  // Account switching buttons above the table
  const renderAccountSwitcher = () => (
    <Box
      mb={2}
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent={{ sm: "space-between" }}
      gap={2}
    >
      <Box display="flex" gap={2} flexWrap="wrap">
        {availableAccounts.map((account) => (
          <Button
            key={account.accountNumber}
            variant={
              selectedAccount === account.accountNumber
                ? "contained"
                : "outlined"
            }
            color="secondary"
            sx={{
              flex: { xs: 1, sm: "auto" },
              height: "50px",
            }}
            onClick={() => setSelectedAccount(account.accountNumber)}
          >
            {t(account.accountName)}
          </Button>
        ))}
      </Box>

      {/* Print Button */}
      <Box>
        <Button
          onClick={handlePrint}
          variant="contained"
          sx={{
            width: { xs: "100%", sm: "120px" },
            height: "50px",
            backgroundColor: colors.blueAccent[600],
            "&:hover": { backgroundColor: colors.blueAccent[500] },
            marginRight: "10px",
          }}
        >
          {t("print")}
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            flex: { xs: 1, sm: "auto" },
            height: "50px",
            backgroundColor: colors.greenAccent[500],
            "&:hover": {
              backgroundColor: colors.greenAccent[400],
            },
          }}
          onClick={() => setNewAccountDialogOpen(true)}
        >
          {t("createNewAccount")}
        </Button>
      </Box>
    </Box>
  );

  const renderAccountSelect = (
    values,
    handleChange,
    handleBlur,
    touched,
    errors
  ) => (
    <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 1" }}>
      <InputLabel htmlFor="bankAccountNumber">
        {t("bankAccountNumber")}
      </InputLabel>
      <Select
        label="bankAccountNumber"
        value={values.bankAccountNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        name="bankAccountNumber"
        error={!!touched.bankAccountNumber && !!errors.bankAccountNumber}
        helperText={touched.bankAccountNumber && errors.bankAccountNumber}
      >
        {availableAccounts.map((account) => (
          <MenuItem key={account.accountNumber} value={account.accountNumber}>
            {account.accountName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  useEffect(() => {
    // Update rows whenever bankStatement or searchResults change
    setRows(searchStatus ? searchResults : bankStatement);
  }, [searchStatus, bankStatement, searchResults]);

  // Calculate totals for each account
  const accountTotals = useMemo(() => {
    if (!bankStatement || !bankAccounts) return {};

    return bankAccounts.reduce((acc, account) => {
      const accountData = bankStatement.filter(
        (row) => row.bankAccountNumber === account.accountNumber
      );

      const totalDeposits = accountData.reduce(
        (sum, row) => sum + Number(row.deposits || 0),
        0
      );
      const totalSpends = accountData.reduce(
        (sum, row) => sum + Number(row.spends || 0),
        0
      );
      const balance = totalDeposits - totalSpends;

      acc[account.accountNumber] = {
        deposits: totalDeposits,
        spends: totalSpends,
        balance: balance,
      };

      return acc;
    }, {});
  }, [bankStatement, bankAccounts]);
  // Render summary section
  const renderSummarySection = () => {
    return (
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
        gap={2}
        mb={3}
        mt={3}
      >
        {bankAccounts?.map((account) => {
          const totals = accountTotals[account.accountNumber] || {
            deposits: 0,
            spends: 0,
            balance: 0,
          };

          return (
            <Box
              key={account.accountNumber}
              bgcolor={colors.primary[400]}
              p={2}
              borderRadius={2}
            >
              <Typography variant="h6" color={colors.grey[100]} mb={1}>
                {t(account.accountName)}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography color={colors.greenAccent[500]}>
                    {t("deposits")}
                  </Typography>
                  <Typography color={colors.grey[100]}>
                    {totals.deposits.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color={colors.greenAccent[500]}>
                    {t("spends")}
                  </Typography>
                  <Typography color={colors.grey[100]}>
                    {totals.spends.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color={colors.greenAccent[500]}>
                    {t("balance")}
                  </Typography>
                  <Typography
                    color={
                      totals.balance >= 0
                        ? colors.greenAccent[500]
                        : colors.redAccent[500]
                    }
                  >
                    {totals.balance.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          );
        })}
      </Box>
    );
  };

  // const profitsAccountTotals = useMemo(() => {
  //   if (!accountTypes.profitsAccount)
  //     return { deposits: 0, spends: 0, balance: 0 };

  //   const profitsData = searchStatus
  //     ? searchResults.filter(
  //         (row) => row.bankAccountNumber === accountTypes.profitsAccount
  //       )
  //     : bankStatement.filter(
  //         (row) => row.bankAccountNumber === accountTypes.profitsAccount
  //       );

  //   const totalDeposits = profitsData.reduce((total, statement) => {
  //     return total + Number(statement.deposits);
  //   }, 0);

  //   const totalSpends = profitsData.reduce((total, statement) => {
  //     return total + Number(statement.spends);
  //   }, 0);

  //   return {
  //     deposits: totalDeposits,
  //     spends: totalSpends,
  //     balance: totalDeposits - totalSpends,
  //   };
  // }, [searchStatus, bankStatement, searchResults, accountTypes.profitsAccount]);

  // const expensesAccountTotals = useMemo(() => {
  //   if (!accountTypes.expensesAccount)
  //     return { deposits: 0, spends: 0, balance: 0 };

  //   const expensesData = searchStatus
  //     ? searchResults.filter(
  //         (row) => row.bankAccountNumber === accountTypes.expensesAccount
  //       )
  //     : bankStatement.filter(
  //         (row) => row.bankAccountNumber === accountTypes.expensesAccount
  //       );

  //   const totalDeposits = expensesData.reduce((total, statement) => {
  //     return total + Number(statement.deposits);
  //   }, 0);

  //   const totalSpends = expensesData.reduce((total, statement) => {
  //     return total + Number(statement.spends);
  //   }, 0);

  //   return {
  //     deposits: totalDeposits,
  //     spends: totalSpends,
  //     balance: totalDeposits - totalSpends,
  //   };
  // }, [
  //   searchStatus,
  //   bankStatement,
  //   searchResults,
  //   accountTypes.expensesAccount,
  // ]);

  // /////////////////////////////

  // const totalSpends = useMemo(() => {
  //   if (searchStatus) {
  //     return searchResults.reduce((total, statement) => {
  //       return total + Number(statement.spends);
  //     }, 0);
  //   }

  //   return bankStatement.reduce((total, statement) => {
  //     return total + Number(statement.spends);
  //   }, 0);
  // }, [searchStatus, bankStatement, searchResults]);

  // const totalDeposits = useMemo(() => {
  //   if (searchStatus) {
  //     return searchResults.reduce((total, statement) => {
  //       return total + Number(statement.deposits);
  //     }, 0);
  //   }

  //   return bankStatement.reduce((total, statement) => {
  //     return total + Number(statement.deposits);
  //   }, 0);
  // }, [searchStatus, bankStatement, searchResults]);

  // const totalBalance = useMemo(() => {
  //   return totalDeposits - totalSpends;
  // }, [totalDeposits, totalSpends]);

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

  const sumRow = useMemo(() => {
    if (!selectedAccount || !filteredData.length) return null;

    const totalDeposits = filteredData.reduce(
      (sum, row) => sum + Number(row.deposits || 0),
      0
    );
    const totalSpends = filteredData.reduce(
      (sum, row) => sum + Number(row.spends || 0),
      0
    );
    const finalBalance = totalDeposits - totalSpends;

    return {
      _id: `sum-${selectedAccount}`,
      statementDate: t("total"),
      deposits: totalDeposits,
      spends: totalSpends,
      balance: finalBalance,
      bankAccountNumber: selectedAccount,
      statementRemarks: "",
      checkNumber: "",
      statementDetails: "",
    };
  }, [filteredData, selectedAccount, t]);

  const rowsWithSum = useMemo(() => {
    if (!filteredData.length || !sumRow) return filteredData;
    return [...filteredData, sumRow];
  }, [filteredData, sumRow]);

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

        if (params.row._id?.startsWith("sum-")) return null;

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
      <CreateNewAccountDialog
        open={newAccountDialogOpen}
        onClose={() => setNewAccountDialogOpen(false)}
        onSubmit={handleCreateNewAccount}
        availableAccounts={availableAccounts || []}
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
            enableReinitialize={true}
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
                    error={
                      !!touched.bankAccountNumber && !!errors.bankAccountNumber
                    }
                    sx={{ gridColumn: "span 1" }}
                  >
                    <InputLabel id="bankAccountNumber-label">
                      {t("bankAccountNumber")}
                    </InputLabel>
                    <Select
                      labelId="bankAccountNumber-label"
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      value={values.bankAccountNumber || defaultAccountNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label={t("bankAccountNumber")}
                    >
                      {bankAccounts?.map((account) => (
                        <MenuItem
                          key={account.accountNumber}
                          value={account.accountNumber}
                        >
                          {t(account.accountName)}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.bankAccountNumber && errors.bankAccountNumber && (
                      <FormHelperText>
                        {t(errors.bankAccountNumber)}
                      </FormHelperText>
                    )}
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
                    type="number"
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
                </Box>
                <Button
                  type="submit"
                  color="secondary"
                  variant="contained"
                  sx={{
                    gridColumn: isNonMobile ? "span 1" : "span 4",
                    display: "flex",
                    justifySelf: isNonMobile ? "flex-end" : "center",
                    height: "50px",
                    marginTop: "10px",
                  }}
                >
                  {t("addNewRow")}
                </Button>
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
              params.row._id?.startsWith("sum-") ? `sum-row-highlight` : ""
            }
            isCellEditable={(params) => !params.row._id?.startsWith("sum-")}
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
          <PrintableTable
            rows={searchStatus ? searchResults : bankStatement}
            columns={columns}
            ref={componentRef}
            orientation="landscape"
            page="bankStatement"
            summary={{
              totalDeposits: formatNegativeNumber(accountTotals.totalDeposits),
              totalSpends: formatNegativeNumber(accountTotals.totalSpends),
              totalBalance: formatNegativeNumber(accountTotals.totalBalance),
            }}
            availableAccounts={availableAccounts}
          />

          {renderSummarySection()}
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
