import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Modal,
  IconButton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
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
import { useReactToPrint } from "react-to-print";
import PrintableTable from "./PrintableTable";
import styles from "./Print.module.css";

const CoSpends = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const componentRef = useRef();
  const detailsComponentRef = useRef();

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSpendType, setSelectedSpendType] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

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
          values: {
            startDate: values.startDate,
            endDate: values.endDate,
          },
        })
      );
      setSearchDates({
        startDate: values.startDate,
        endDate: values.endDate,
      });
      setIsSearchActive(true);
    } catch (error) {
      console.error("Error searching:", error);
    }
  }

  const handleClearSearch = () => {
    setSearchDates({
      startDate: "",
      endDate: "",
    });
    setIsSearchActive(false);
    dispatch(fetchPettyCash());
    dispatch(fetchBankStatement());
  };

  useEffect(() => {
    dispatch(fetchPettyCash());
    dispatch(fetchBankStatement(token));
    dispatch(fetchAllSpendTypes());
    dispatch(fetchDrivers(token));
    dispatch(fetchUsers(token));
  }, [dispatch, token]);

  const combinedData = useMemo(() => {
    // If we have search results, use those instead of the full data
    if (isSearchActive && searchResults) {
      const pettyCashData =
        searchResults.pettyCash?.map((item) => ({
          date: item.requestDate,
          source: "PettyCash",
          remarks: item.spendsRemarks,
          ...item,
        })) || [];

      const bankStatementData =
        searchResults.bankStatement?.map((item) => ({
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

    const bankStatementData =
      bankStatement
        .filter((x) => x.spends > 0)
        .map((item) => ({
          date: item.statementDate,
          source: "BankStatement",
          remarks: item.statementRemarks,
          cashAmount: item.spends,
          ...item,
        })) || [];

    return [...pettyCashData, ...bankStatementData];
  }, [pettyCash, bankStatement, searchResults, isSearchActive]);

  const groupedData = useMemo(() => {
    // Group data by spendType, and then by source and serialNumber
    const grouped = combinedData.reduce((acc, item) => {
      const spendTypeId = item.spendType;
      const groupKey = `${spendTypeId}-${item.source || ""}-${
        item.serialNumber || ""
      }`;

      if (!acc[groupKey]) {
        acc[groupKey] = {
          _id: `group-${groupKey}`,
          spendType: spendTypeId,
          source: item.source,
          serialNumber: item.serialNumber,
          date: item.date, // Keep the date of the first entry
          cashAmount: 0,
          details: [],
          isGroupRow: true,
          hasMultipleEntries: false,
        };
      }

      acc[groupKey].cashAmount += Number(item.cashAmount || 0);
      acc[groupKey].details.push(item);
      acc[groupKey].hasMultipleEntries = acc[groupKey].details.length > 1;

      return acc;
    }, {});

    return Object.values(grouped);
  }, [combinedData]);

  const handleRowClick = (spendTypeId) => {
    setSelectedSpendType(
      groupedData.find((row) => row.spendType === spendTypeId)
    );
    setModalOpen(true);
  };

  // Handle main table printing
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Handle detailed view printing
  const handleDetailsPrint = useReactToPrint({
    content: () => detailsComponentRef.current,
  });

  // Calculate totals for summary
  const totalSpends = useMemo(() => {
    return Number(
      groupedData.reduce((sum, item) => sum + Number(item.cashAmount || 0), 0)
    ).toFixed(3);
  }, [groupedData]);

  const totalAmountOnWorker = useMemo(() => {
    return Number(
      combinedData.reduce(
        (sum, item) =>
          sum +
          (item.deductedFromDriver || item.deductedFromUser
            ? Number(item.cashAmount || 0)
            : 0),
        0
      )
    ).toFixed(3);
  }, [combinedData]);

  const totalAmountOnCompany = Number(
    totalSpends - totalAmountOnWorker
  ).toFixed(3);

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
      field: "spendType",
      headerName: t("spendTypes"),
      flex: 1,
      align: "center",
      renderCell: ({ row }) => {
        if (!row.spendType) return null;

        const spendTypeObj = spendTypes.find((s) => s._id === row.spendType);
        if (!spendTypeObj) return "Unknown Type";

        return (
          <Box display="flex" alignItems="center" gap={1}>
            {spendTypeObj.name}
            {row.hasMultipleEntries && (
              <IconButton
                size="small"
                onClick={() => handleRowClick(row.spendType)}
              >
                <InfoIcon />
              </IconButton>
            )}
          </Box>
        );
      },
    },
    {
      field: "cashAmount",
      headerName: t("cashSpends"),
      flex: 1,
      valueFormatter: (params) => {
        return Number(params.value).toFixed(3);
      },
    },
    // {
    //   field: "fetchedDeduction",
    //   headerName: t("deductedFrom"),
    //   flex: 1,
    //   renderCell: ({ row: { deductedFromDriver, deductedFromUser } }) => {
    //     if (!deductedFromDriver && !deductedFromUser) return null;

    //     let person = "";

    //     if (deductedFromDriver) {
    //       person = drivers.find((d) => d._id === deductedFromDriver);
    //     } else if (deductedFromUser) {
    //       person = users.find((u) => u._id === deductedFromUser);
    //     }

    //     // Return null or placeholder if person not found
    //     if (!person) return "N/A";

    //     return (
    //       <Box display="flex" justifyContent="center" borderRadius="4px">
    //         {person.firstName} {person.lastName}
    //       </Box>
    //     );
    //   },
    // },
    // { field: "remarks", headerName: t("remarks"), flex: 1 },
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
              <Box display="flex" gap={2}>
                <Button type="submit" color="secondary" variant="contained">
                  {t("search")}
                </Button>
                {isSearchActive && (
                  <Button
                    type="button"
                    color="error"
                    variant="contained"
                    onClick={handleClearSearch}
                  >
                    {t("clear")}
                  </Button>
                )}
              </Box>

              <Box
                display="flex"
                sx={{ gridColumn: "span 2" }}
                gap="20px"
                justifyContent="flex-end"
              >
                <Button
                  onClick={handlePrint}
                  color="primary"
                  variant="contained"
                >
                  {t("print")}
                </Button>
              </Box>
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
          "& .grouped-row": {
            backgroundColor: colors.blueAccent[900],
            "&:hover": {
              backgroundColor: colors.blueAccent[600],
            },
          },
        }}
      >
        <DataGrid
          rows={groupedData}
          columns={columns}
          getRowId={(row) => row._id}
          // getRowClassName={(params) =>
          //   params.row.hasMultipleEntries ? "grouped-row" : ""
          // }
        />
      </Box>

      {/* Add Summary Section */}
      <Box
        mt={4}
        p={3}
        bgcolor={colors.primary[400]}
        borderRadius="4px"
        display="grid"
        gap="30px"
        sx={{
          gridTemplateColumns: {
            xs: "1fr", // Single column on mobile
            sm: "repeat(2, 1fr)", // Two columns on tablet
            md: "repeat(3, 1fr)", // Three columns on desktop
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
            {t("totalSpends")}
          </Typography>
          <Typography
            variant="h4"
            color="secondary"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
            }}
          >
            <span>{totalSpends}</span>
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
            {t("totalAmountOnWorkers")}
          </Typography>
          <Typography
            variant="h4"
            color="secondary"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
            }}
          >
            <span>{totalAmountOnWorker}</span>
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
            {t("totalAmountOnCompany")}
          </Typography>
          <Typography
            variant="h4"
            color="secondary"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
            }}
          >
            <span>{totalAmountOnCompany}</span>
            <span style={{ fontSize: "1em" }}> KD</span>
          </Typography>
        </Box>
      </Box>

      {/* Hidden Printable Tables */}
      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          {/* Main Summary Table */}
          <PrintableTable
            rows={groupedData}
            columns={columns}
            page="coSpends"
            summary={{
              totalSpends,
              totalAmountOnWorker,
              totalAmountOnCompany,
            }}
          />

          {/* Detail Tables - One for each grouped item */}
          {groupedData
            .filter((group) => group.hasMultipleEntries)
            .map((group, index) => (
              <div key={group._id} className={styles.pageBreak}>
                <PrintableTable
                  rows={group.details}
                  columns={[
                    {
                      field: "date",
                      headerName: t("date"),
                      valueFormatter: (params) => {
                        const date = new Date(params.value);
                        return `${date.getDate()}/${
                          date.getMonth() + 1
                        }/${date.getFullYear()}`;
                      },
                    },
                    { field: "serialNumber", headerName: t("serialNumber") },
                    { field: "source", headerName: t("from") },
                    {
                      field: "cashAmount",
                      headerName: t("cashSpends"),
                      valueFormatter: (params) =>
                        Number(params.value).toFixed(3),
                    },
                    { field: "remarks", headerName: t("remarks") },
                  ]}
                  page="coSpendsDetails"
                  summary={{
                    totalAmount: group.cashAmount,
                    spendTypeName: spendTypes.find(
                      (s) => s._id === group.spendType
                    )?.name,
                  }}
                />
              </div>
            ))}
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="spend-type-details"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxHeight: "80vh",
            bgcolor: colors.primary[400],
            border: `2px solid ${colors.primary[500]}`,
            boxShadow: 24,
            p: 4,
            overflow: "auto",
          }}
        >
          {selectedSpendType && (
            <>
              <Typography variant="h5" mb={3}>
                {
                  spendTypes.find((s) => s._id === selectedSpendType.spendType)
                    ?.name
                }{" "}
                - Details
              </Typography>
              <DataGrid
                rows={selectedSpendType.details}
                columns={[
                  {
                    field: "date",
                    headerName: t("date"),
                    flex: 1,
                    valueFormatter: (params) => {
                      const date = new Date(params.value);
                      return `${date.getDate()}/${
                        date.getMonth() + 1
                      }/${date.getFullYear()}`;
                    },
                  },
                  {
                    field: "serialNumber",
                    headerName: t("serialNumber"),
                    flex: 1,
                  },
                  { field: "source", headerName: t("from"), flex: 1 },
                  { field: "cashAmount", headerName: t("cashSpends"), flex: 1 },
                  { field: "remarks", headerName: t("remarks"), flex: 1 },
                ]}
                getRowId={(row) => row._id}
                autoHeight
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
              />
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default CoSpends;
