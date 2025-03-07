import React, { useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Button,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";
import * as yup from "yup";
import Header from "../components/Header";
import { tokens } from "../theme";
import { pulsar } from "ldrs";
import { Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCompanyIncome,
  createCompanyIncome,
} from "../redux/companyIncomeSlice";
import ClearIcon from "@mui/icons-material/Clear";
import { fetchCurrentYearPettyCash } from "../redux/pettyCashSlice";
import { fetchAllSpendTypes } from "../redux/spendTypeSlice";
import { groupBy } from "lodash";
import { useTranslation } from "react-i18next";

const Types = ["Income", "Refund"];

const Income = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isNonMobile = useMediaQuery("(min-width: 600px)");

  const companyIncomeData = useSelector(
    (state) => state.companyIncome.companyIncome
  );
  const pageStatus = useSelector((state) => state.companyIncome.status);
  const error = useSelector((state) => state.companyIncome.error);
  const spendTypes = useSelector((state) => state.spendType.spendTypes);

  const pettyCash = useSelector(
    (state) => state.pettyCash.currentYearPettyCash
  );

  const INCOME_FIELDS = [
    {
      fieldName: "carIncome",
      label: t("talabatCarIncome"),
    },
    {
      fieldName: "bikeIncome",
      label: t("talabatBikeIncome"),
    },
    {
      fieldName: "otherIncome",
      label: t("talabatOtherIncome"),
    },
  ];

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const initialValues = {
    type: "Income",
    month: "",
    year: new Date().getFullYear(),
    bikeIncome: 0,
    carIncome: 0,
    otherIncome: 0,
    refundCompany: "",
    refundAmount: 0,
    lastMonthIncome: 0,
    lendsIncome: 0,
    moneySafeBalance: 0,
  };

  const requestSchema = yup.object().shape({
    type: yup.string().required(t("selectIncomeType")),
    month: yup.string().required(t("selectMonth")),
    year: yup.number().required(t("year")),
    bikeIncome: yup.number(t("talabatBikeIncome")),
    carIncome: yup.number(t("talabatCarIncome")),
    otherIncome: yup.number(t("talabatOtherIncome")),
    refundCompany: yup.string(t("refundCompany")),
    refundAmount: yup.number(t("refundAmount")),
    lastMonthIncome: yup.number(t("lastMonthIncome")),
    lendsIncome: yup.number(t("lendsIncome")),
    moneySafeBalance: yup.number(t("moneySafeBalance")),
  });

  const aggregatedIncomeResults = useMemo(() => {
    const aggregatedResults = [];

    for (const income_type of INCOME_FIELDS) {
      const aggregatedData = {
        perMonthCash: months.reduce((result, month) => {
          return { ...result, [month]: { cashAmount: 0 } };
        }, {}),
        name: income_type.label,
        id: income_type.label,
      };

      for (let i = 0; i < months.length; i++) {
        const month = months[i];
        const results = companyIncomeData.filter(
          (c) => c.month === i && c.type === "Income"
        );

        for (const result of results) {
          const existingData = aggregatedData.perMonthCash[month];

          existingData.cashAmount += result[income_type.fieldName];
        }
      }

      aggregatedResults.push(aggregatedData);
    }

    const totalResult = {
      perMonthCash: months.reduce((result, month) => {
        return { ...result, [month]: { cashAmount: 0 } };
      }, {}),
      name: t("total"),
      id: t("total"),
    };

    for (const result of aggregatedResults) {
      for (const month of months) {
        totalResult.perMonthCash[month].cashAmount +=
          result.perMonthCash[month].cashAmount;
      }
    }

    aggregatedResults.push(totalResult);

    return aggregatedResults;
  }, [companyIncomeData, t]);

  const aggregatedPettyCash = useMemo(() => {
    const groupedResult = groupBy(pettyCash, (item) => {
      return item.spendType;
    });

    const aggregatedResults = [];

    for (const spendTypeId of Object.keys(groupedResult)) {
      const spendType =
        spendTypes.find((o) => o._id === spendTypeId)?.name || "";
      const aggregatedData = {
        perMonthCash: months.reduce((result, month) => {
          return { ...result, [month]: { cashAmount: 0 } };
        }, {}),
        name: spendType,
        id: spendTypeId,
      };

      for (let i = 0; i < months.length; i++) {
        const month = months[i];
        const results = groupedResult[spendTypeId].filter(
          (obj) => new Date(obj.spendsDate).getMonth() === i
        );

        for (const result of results) {
          const existingData = aggregatedData.perMonthCash[month];

          existingData.cashAmount += result.cashAmount;
        }
      }
      aggregatedResults.push(aggregatedData);
    }

    const totalResult = {
      perMonthCash: months.reduce((result, month) => {
        return { ...result, [month]: { cashAmount: 0 } };
      }, {}),
      name: t("totalSpends"),
      id: t("totalSpends"),
    };

    const netProfitLossesResult = {
      perMonthCash: months.reduce((result, month) => {
        return { ...result, [month]: { cashAmount: 0 } };
      }, {}),
      name: t("netProfitLosses"),
      id: t("netProfitLosses"),
    };

    for (const result of aggregatedResults) {
      for (const month of months) {
        totalResult.perMonthCash[month].cashAmount +=
          result.perMonthCash[month].cashAmount;
      }
    }

    const totalIncomeResult =
      aggregatedIncomeResults[aggregatedIncomeResults.length - 1];

    for (const month of months) {
      netProfitLossesResult.perMonthCash[month].cashAmount =
        totalIncomeResult.perMonthCash[month].cashAmount -
        totalResult.perMonthCash[month].cashAmount;
    }

    aggregatedResults.push(totalResult);
    aggregatedResults.push(netProfitLossesResult);

    return aggregatedResults;
  }, [pettyCash, spendTypes, aggregatedIncomeResults, t]);

  const aggregatedRefunds = useMemo(() => {
    const aggregatedResults = [];

    const groupedResult = groupBy(
      companyIncomeData.filter((obj) => obj.type === "Refund"),
      (item) => item.refundCompany
    );

    for (const companyRefund of Object.keys(groupedResult)) {
      const aggregatedData = {
        perMonthCash: months.reduce((result, month) => {
          return { ...result, [month]: { cashAmount: 0 } };
        }, {}),
        name: companyRefund,
        id: companyRefund,
      };

      for (let i = 0; i < months.length; i++) {
        const month = months[i];
        const results = groupedResult[companyRefund].filter(
          (o) => o.month === i
        );

        for (const result of results) {
          const existingData = aggregatedData.perMonthCash[month];

          existingData.cashAmount += result.refundAmount;
        }
      }

      aggregatedResults.push(aggregatedData);
    }

    const totalResult = {
      perMonthCash: months.reduce((result, month) => {
        return { ...result, [month]: { cashAmount: 0 } };
      }, {}),
      name: t("totalRefunds"),
      id: t("totalRefunds"),
    };

    for (const result of aggregatedResults) {
      for (const month of months) {
        totalResult.perMonthCash[month].cashAmount +=
          result.perMonthCash[month].cashAmount;
      }
    }

    aggregatedResults.push(totalResult);

    const netProfitLossesResult = {
      perMonthCash: months.reduce((result, month) => {
        return { ...result, [month]: { cashAmount: 0 } };
      }, {}),
      name: t("netProfitLossesAfterRefunds"),
      id: t("netProfitLossesAfterRefunds"),
    };

    const totalIncomeResult =
      aggregatedPettyCash[aggregatedPettyCash.length - 1];

    for (const month of months) {
      netProfitLossesResult.perMonthCash[month].cashAmount =
        totalIncomeResult.perMonthCash[month].cashAmount +
        totalResult.perMonthCash[month].cashAmount;
    }

    aggregatedResults.push(netProfitLossesResult);

    return aggregatedResults;
  }, [companyIncomeData, aggregatedPettyCash, t]);

  useEffect(() => {
    dispatch(fetchCompanyIncome());
    dispatch(fetchCurrentYearPettyCash());
    dispatch(fetchAllSpendTypes());
  }, [dispatch]);

  const columns = [
    {
      field: "name",
      headerName: t("totalSpends"),
      flex: 1,
      resizable: true,
    },
    ...months.map((month) => ({
      field: `cashAmount${month}`,
      headerName: t(month),
      flex: 0.75,
      resizable: true,
      renderCell: ({ row }) => {
        const { perMonthCash } = row;

        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {perMonthCash[month]?.cashAmount || 0}
          </Box>
        );
      },
    })),
  ];

  const companyIncomes = [
    { field: "incomeType", headerName: t("income") },
    ...months.map((month) => ({
      field: `cashAmount${month}`,
      headerName: t(month),
      flex: 0.75,
      resizable: true,
    })),
  ];

  const isTotalRow = (row) => {
    return (
      row.name === t("total") ||
      row.name === t("totalSpends") ||
      row.name === t("totalRefunds") ||
      row.name === t("netProfitLosses") ||
      row.name === t("netProfitLossesAfterRefunds")
    );
  };

  pulsar.register();
  if (pageStatus === "loading") {
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

  if (pageStatus === "failed") {
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

  async function handleFormSubmit(values) {
    try {
      const month = months.findIndex((m) => m === values.month);

      dispatch(
        createCompanyIncome({
          values: {
            ...values,
            month,
          },
        })
      );
    } catch (error) {
      console.error("Row does not have a valid _id field:");
    }
  }

  return (
    <Box m="20px">
      <Header
        title={t("profitsAndLossesTitle")}
        subtitle={t("profitsAndLossesSubtitle")}
      />
      <Formik
        initialValues={initialValues}
        validationSchema={requestSchema}
        onSubmit={handleFormSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <Header title={t("addNewCompanyIncome")} />
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 2" },
              }}
            >
              <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                <InputLabel id="select-income-type-label">
                  {t("selectIncomeType")}
                </InputLabel>
                <Select
                  labelId="select-income-type-label"
                  id="select-income-type"
                  value={values.type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.type && !!errors.type}
                  name="type"
                  label="Select Income type"
                  disabled={!!values.type}
                >
                  {Types.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {values.type && (
                  <IconButton
                    onClick={() => setFieldValue("type", "")}
                    sx={{ gridColumn: "span 1" }}
                    style={{
                      display: "flex",
                      width: "30px",
                      height: "30px",
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                )}
              </FormControl>
              <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                <InputLabel id="select-month-label">
                  {t("selectMonth")}
                </InputLabel>
                <Select
                  labelId="select-month-label"
                  id="select-month"
                  value={values.month}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.month && !!errors.month}
                  name="month"
                  label="Select Month"
                  disabled={!!values.month}
                >
                  {months.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
                {values.month && (
                  <IconButton
                    onClick={() => setFieldValue("month", "")}
                    sx={{ gridColumn: "span 1" }}
                    style={{
                      display: "flex",
                      width: "30px",
                      height: "30px",
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                )}
              </FormControl>
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("year")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.year}
                name="year"
                error={!!touched.year && !!errors.year}
                helperText={touched.year && errors.year}
                sx={{ gridColumn: "span 1" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("bikeIncome")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.bikeIncome}
                name="bikeIncome"
                error={!!touched.bikeIncome && !!errors.bikeIncome}
                helperText={touched.bikeIncome && errors.bikeIncome}
                sx={{ gridColumn: "span 1" }}
                disabled={values.type === "Refund"}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("carIncome")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.carIncome}
                name="carIncome"
                error={!!touched.carIncome && !!errors.carIncome}
                helperText={touched.carIncome && errors.carIncome}
                sx={{ gridColumn: "span 1" }}
                disabled={values.type === "Refund"}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("otherIncome")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.otherIncome}
                name="otherIncome"
                error={!!touched.otherIncome && !!errors.otherIncome}
                helperText={touched.otherIncome && errors.otherIncome}
                sx={{ gridColumn: "span 1" }}
                disabled={values.type === "Refund"}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("lastMonthIncome")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastMonthIncome}
                name="lastMonthIncome"
                error={!!touched.lastMonthIncome && !!errors.lastMonthIncome}
                helperText={touched.lastMonthIncome && errors.lastMonthIncome}
                sx={{ gridColumn: "span 1" }}
                disabled={values.type === "Refund"}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("lendsIncome")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lendsIncome}
                name="lendsIncome"
                error={!!touched.lendsIncome && !!errors.lendsIncome}
                helperText={touched.lendsIncome && errors.lendsIncome}
                sx={{ gridColumn: "span 1" }}
                disabled={values.type === "Refund"}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("moneySafeBalance")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.moneySafeBalance}
                name="moneySafeBalance"
                error={!!touched.moneySafeBalance && !!errors.moneySafeBalance}
                helperText={touched.moneySafeBalance && errors.moneySafeBalance}
                sx={{ gridColumn: "span 1" }}
                disabled={values.type === "Refund"}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={t("refundCompany")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.refundCompany}
                name="refundCompany"
                error={!!touched.refundCompany && !!errors.refundCompany}
                helperText={touched.refundCompany && errors.refundCompany}
                sx={{ gridColumn: "span 1" }}
                disabled={values.type === "Income"}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("refundAmount")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.refundAmount}
                name="refundAmount"
                error={!!touched.refundAmount && !!errors.refundAmount}
                helperText={touched.refundAmount && errors.refundAmount}
                sx={{ gridColumn: "span 1" }}
                disabled={values.type === "Income"}
              />

              <Button type="submit" color="secondary" variant="contained">
                {t("saveData")}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <Box mt="40px">
        <Box
          mb="40px"
          height="40vh"
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
            "& .total-row": {
              bgcolor: colors.greenAccent[700],
              fontWeight: "bold",
              // fontSize: "1rem",
              "&:hover": {
                bgcolor: colors.greenAccent[600],
              },
              "& .MuiDataGrid-cell": {
                color: colors.grey[100],
              },
              borderBottom: `2px solid ${colors.grey[100]}`,
            },
          }}
        >
          <DataGrid
            rows={aggregatedIncomeResults}
            columns={columns}
            getRowClassName={(params) =>
              isTotalRow(params.row) ? "total-row" : ""
            }
          />
        </Box>
        <Box
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
            "& .total-row": {
              bgcolor: colors.greenAccent[700],
              fontWeight: "bold",
              // fontSize: "1rem",
              "&:hover": {
                bgcolor: colors.greenAccent[600],
              },
              "& .MuiDataGrid-cell": {
                color: colors.grey[100],
              },
              borderBottom: `2px solid ${colors.grey[100]}`,
            },
          }}
        >
          <DataGrid
            rows={aggregatedPettyCash}
            columns={columns}
            getRowClassName={(params) =>
              isTotalRow(params.row) ? "total-row" : ""
            }
          />
        </Box>

        <Box
          mb="40px"
          height="40vh"
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
            "& .total-row": {
              bgcolor: colors.greenAccent[700],
              fontWeight: "bold",
              // fontSize: "1rem",
              "&:hover": {
                bgcolor: colors.greenAccent[600],
              },
              "& .MuiDataGrid-cell": {
                color: colors.grey[100],
              },
              borderBottom: `2px solid ${colors.grey[100]}`,
            },
          }}
        >
          <DataGrid
            rows={aggregatedRefunds}
            columns={columns}
            getRowClassName={(params) =>
              isTotalRow(params.row) ? "total-row" : ""
            }
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Income;
