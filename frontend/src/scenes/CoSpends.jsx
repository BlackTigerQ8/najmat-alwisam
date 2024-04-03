import React, { useEffect, useMemo } from "react";
import { Box, useTheme } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { tokens } from "../theme";
import { fetchPettyCash } from "../redux/pettyCashSlice";
import { fetchBankStatement } from "../redux/bankStatementSlice";
import { pulsar } from "ldrs";

const CoSpends = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();

  const pettyCash = useSelector((state) => state.pettyCash.pettyCash);
  const bankStatement = useSelector(
    (state) => state.bankStatement.bankStatement
  );
  const status = useSelector((state) => state.pettyCash.status);
  const error = useSelector((state) => state.pettyCash.error);

  const token = localStorage.getItem("token");

  useEffect(() => {
    dispatch(fetchPettyCash());
    dispatch(fetchBankStatement(token));
  }, [dispatch, token]);

  const combinedData = useMemo(() => {
    const pettyCashData = pettyCash.map((item) => ({
      date: item.date,
      source: "PettyCash",
      ...item,
    }));
    const bankStatementData = bankStatement.map((item) => ({
      date: item.statementDate,
      source: "BankStatement",
      ...item,
    }));
    return [...pettyCashData, ...bankStatementData];
  }, [pettyCash, bankStatement]);

  const columns = [
    { field: "date", headerName: "Date", flex: 1 },
    { field: "source", headerName: "From", flex: 1 },
    { field: "name", headerName: "Spends Type", flex: 1 },
    { field: "cashAmount", headerName: "Cash Spends", flex: 1 },
    { field: "fetchedDeduction", headerName: "Deducted From", flex: 1 },
    { field: "remarks", headerName: "Remarks", flex: 1 },
  ];

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
      <Header title="SPEND TYPES" subtitle="Spend type Page" />
      <Box
        mt="40px"
        mb="40px"
        height="65vh"
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
          rows={combinedData}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default CoSpends;
