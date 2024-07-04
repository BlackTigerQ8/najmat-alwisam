import React, { useEffect, useMemo } from "react";
import { Box, useTheme } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { tokens } from "../theme";
import { fetchPettyCash } from "../redux/pettyCashSlice";
import { fetchBankStatement } from "../redux/bankStatementSlice";
import { pulsar } from "ldrs";
import { fetchAllSpendTypes } from "../redux/spendTypeSlice";
import { fetchDrivers } from "../redux/driversSlice";
import { fetchUsers } from "../redux/usersSlice";
import { useTranslation } from "react-i18next";

const CoSpends = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const pettyCash = useSelector((state) => state.pettyCash.pettyCash);
  const bankStatement = useSelector(
    (state) => state.bankStatement.bankStatement
  );
  const drivers = useSelector((state) => state.drivers.drivers);
  const users = useSelector((state) => state.users.users);
  const spendTypes = useSelector((state) => state.spendType.spendTypes);
  const status = useSelector((state) => state.pettyCash.status);
  const error = useSelector((state) => state.pettyCash.error);

  const token = localStorage.getItem("token");

  useEffect(() => {
    dispatch(fetchPettyCash());
    dispatch(fetchBankStatement(token));
    dispatch(fetchAllSpendTypes());
    dispatch(fetchDrivers(token));
    dispatch(fetchUsers(token));
  }, [dispatch, token]);

  const combinedData = useMemo(() => {
    const pettyCashData = pettyCash.map((item) => ({
      date: item.requestDate,
      source: "PettyCash",
      remarks: item.spendsRemarks,
      ...item,
    }));
    const bankStatementData = bankStatement
      .filter((x) => x.spends > 0)
      .map((item) => ({
        date: item.statementDate,
        source: "BankStatement",
        remarks: item.statementRemarks,
        cashAmount: item.spends,
        ...item,
      }));
    return [...pettyCashData, ...bankStatementData];
  }, [pettyCash, bankStatement]);

  const columns = [
    {
      field: "date",
      headerName: t("date"),
      flex: 1,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        const formattedDate = `${date.getDate()}/${
          date.getMonth() + 1
        }/${date.getFullYear()}`;
        return formattedDate;
      },
    },
    { field: "source", headerName: t("from"), flex: 1 },
    {
      field: "name",
      headerName: t("spendTypes"),
      flex: 1,
      renderCell: ({ row: { spendType } }) => {
        if (!spendType) return null;

        const { name = undefined } = spendTypes.find(
          (s) => s._id === spendType
        );

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {name}
          </Box>
        );
      },
    },
    { field: "cashAmount", headerName: t("cashSpends"), flex: 1 },
    {
      field: "fetchedDeduction",
      headerName: t("deductedFrom"),
      flex: 1,
      renderCell: ({ row: { deductedFromDriver, deductedFromUser } }) => {
        if (!deductedFromDriver && !deductedFromUser) return null;

        const { firstName = undefined, lastName = undefined } =
          deductedFromDriver
            ? drivers.find((d) => d._id === deductedFromDriver)
            : users.find((u) => u._id === deductedFromUser);

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {firstName} {lastName}
          </Box>
        );
      },
    },
    { field: "remarks", headerName: t("remarks"), flex: 1 },
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
      <Header
        title={t("companySpendsTitle")}
        subtitle={t("companySpendsSubtitle")}
      />
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
