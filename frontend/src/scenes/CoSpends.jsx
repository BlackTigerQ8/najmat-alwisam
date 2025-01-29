import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { tokens } from "../theme";
import { fetchPettyCash, searchCombinedSpends } from "../redux/pettyCashSlice";
import { fetchBankStatement } from "../redux/bankStatementSlice";
import { pulsar } from "ldrs";
import { fetchAllSpendTypes } from "../redux/spendTypeSlice";
import { fetchDrivers } from "../redux/driversSlice";
import { fetchUsers } from "../redux/usersSlice";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { Formik } from "formik";

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
  const searchResults = useSelector(
    (state) => state.pettyCash.combinedSearchResults
  );

  const token = localStorage.getItem("token");

  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const [searchDates, setSearchDates] = useState({
    startDate: "",
    endDate: "",
  });

  const searchSchema = yup.object().shape({
    startDate: yup.string().required("Start date is required"),
    endDate: yup
      .string()
      .required("End date is required")
      .test("dates", "End date must be after start date", function (endDate) {
        const { startDate } = this.parent;
        if (!startDate || !endDate) return true;
        return new Date(endDate) >= new Date(startDate);
      }),
  });

  async function handleFormSubmit(values) {
    try {
      dispatch(
        searchCombinedSpends({
          values,
        })
      );
      setSearchDates({
        startDate: values.startDate,
        endDate: values.endDate,
      });
    } catch (error) {
      console.error("Error searching:", error);
    }
  }

  useEffect(() => {
    dispatch(fetchPettyCash());
    dispatch(fetchBankStatement(token));
    dispatch(fetchAllSpendTypes());
    dispatch(fetchDrivers(token));
    dispatch(fetchUsers(token));
  }, [dispatch, token]);

  const combinedData = useMemo(() => {
    // If we have search results, use those instead of the full data
    if (searchResults) {
      const pettyCashData = searchResults.pettyCash.map((item) => ({
        date: item.requestDate,
        source: "PettyCash",
        remarks: item.spendsRemarks,
        ...item,
      }));
      const bankStatementData =
        searchResults.bankStatement
          ?.filter((x) => x.spends > 0)
          .map((item) => ({
            date: item.statementDate,
            source: "BankStatement",
            remarks: item.statementRemarks,
            cashAmount: item.spends,
            ...item,
          })) || [];
      return [...pettyCashData, ...bankStatementData];
    }

    // Otherwise use the full data
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
  }, [pettyCash, bankStatement, searchResults]);

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
    { field: "serialNumber", headerName: t("serialNumber"), flex: 1 },
    { field: "source", headerName: t("from"), flex: 1 },
    {
      field: "name",
      headerName: t("spendTypes"),
      flex: 1,
      renderCell: ({ row: { spendType } }) => {
        if (!spendType) return null;

        const spendTypeObj = spendTypes.find((s) => s._id === spendType);
        if (!spendTypeObj) return "Unknown Type"; // Fallback for deleted/missing spend types

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {spendTypeObj.name}
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

        let person = "";

        if (deductedFromDriver) {
          person = drivers.find((d) => d._id === deductedFromDriver);
        } else if (deductedFromUser) {
          person = users.find((u) => u._id === deductedFromUser);
        }

        // Return null or placeholder if person not found
        if (!person) return "N/A";

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {person.firstName} {person.lastName}
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

  if (!drivers.length || !users.length || !spendTypes.length) {
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

  return (
    <Box m="20px">
      <Header
        title={t("companySpendsTitle")}
        subtitle={t("companySpendsSubtitle")}
      />
      <Typography variant="h5" color="secondary" mb={2}>
        {t("searchPettyCash")}
      </Typography>

      <Formik
        initialValues={{
          startDate: searchDates.startDate,
          endDate: searchDates.endDate,
        }}
        validationSchema={searchSchema}
        onSubmit={handleFormSubmit}
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
              gridTemplateColumns="repeat(5, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 5" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label={t("startingDate")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.startDate}
                name="startDate"
                error={!!touched.startDate && !!errors.startDate}
                helperText={touched.startDate && errors.startDate}
                sx={{ gridColumn: "span 1" }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label={t("endingDate")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.endDate}
                name="endDate"
                error={!!touched.endDate && !!errors.endDate}
                helperText={touched.endDate && errors.endDate}
                sx={{ gridColumn: "span 1" }}
                InputLabelProps={{ shrink: true }}
              />
              <Button type="submit" color="secondary" variant="contained">
                {t("search")}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
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
