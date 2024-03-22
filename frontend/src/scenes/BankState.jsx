import React, { useEffect, useState } from "react";
import { Box, useTheme, Typography, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { tokens } from "../theme";
import { pulsar } from "ldrs";
import { useSelector, useDispatch } from "react-redux";
import { fetchBankStatement } from "../redux/bankStatementSlice";

const BankState = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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
      field: "statementMonth",
      headerName: "Month",
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
    {
      field: "statementDate",
      headerName: "Date",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
  ];

  useEffect(() => {
    dispatch(fetchBankStatement(token));
  }, [token]);

  pulsar.register();

  const handleCellValueChange = (params) => {
    const { id, field, value } = params;
    const updatedStatement = bankStatement.map((row) =>
      row._id === id ? { ...row, [field]: value } : row
    );
    setEditRowsModel(updatedStatement);
  };

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
