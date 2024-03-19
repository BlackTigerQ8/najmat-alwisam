import React, { useEffect, useState } from "react";
import { Box, useTheme, Button, TextField, Typography } from "@mui/material";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { tokens } from "../theme";
import { useSelector, useDispatch } from "react-redux";
import { fetchPettyCash } from "../redux/pettyCashSlice";
import { pulsar } from "ldrs";

const PettyCash = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const pettyCash = useSelector((state) => state.pettyCash.pettyCash);
  const status = useSelector((state) => state.pettyCash.status);
  const error = useSelector((state) => state.pettyCash.error);
  const token =
    useSelector((state) => state.pettyCash.token) ||
    localStorage.getItem("token");

  const [totalSpends, setTotalSpends] = useState(0);
  const [totalAmountOnWorker, setTotalAmountOnWorker] = useState(0);
  const [totalAmountOnCompany, setTotalAmountOnCompany] = useState(0);

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "ID",
    },
    {
      field: "spendsDate",
      headerName: "Spends Date",
      flex: 1,
    },
    {
      field: "spendsReason",
      headerName: "Spends Reason",
      flex: 1,
    },
    {
      field: "cashAmount",
      headerName: "Cash Amount",
      flex: 1,
    },
    {
      field: "spendType",
      headerName: "spendType",
      flex: 1,
    },
    {
      field: "spendsRemarks",
      headerName: "Remarks",
      flex: 1,
    },
    {
      field: "deductedFrom",
      headerName: "Deducted From",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchPettyCash(token);
        const data = response.payload;
        setTotalSpends(data.totalSpends);
        setTotalAmountOnWorker(data.totalAmountOnWorker);
        setTotalAmountOnCompany(data.totalAmountOnCompany);
      } catch (error) {
        console.error("Error fetching petty cash data:", error);
      }
    };
    fetchData();
  }, [token]);

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
      <Header title="PETTY CASH" subtitle="Petty Cash Page" />
      <Formik>
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
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Serial Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values}
                name="serialNumber"
                error={!!touched.serialNumber && !!errors.serialNumber}
                helperText={touched.serialNumber && errors.serialNumber}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Request Applicant"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values}
                name="applicant"
                error={!!touched.requestApplicant && !!errors.applicant}
                helperText={touched.applicant && errors.applicant}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="Resquest Date"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values}
                name="requestDate"
                error={!!touched.requestDate && !!errors.requestDate}
                helperText={touched.requestDate && errors.requestDate}
                sx={{ gridColumn: "span 1" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Submit
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
          rows={Array.isArray(pettyCash) ? pettyCash : []}
          columns={columns}
          getRowId={(row) => row._id}
        />
        <Box
          display="grid"
          gap="70px"
          gridTemplateColumns="repeat(3, minmax(0, 1fr))"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
          }}
        >
          <Typography variant="h4" color="secondary" mt={4}>
            Total spends:
            <strong>
              <span> {totalSpends} </span> KD
            </strong>
          </Typography>
          <Typography variant="h4" color="secondary" mt={4}>
            Total amount on workers:
            <strong>
              <span> {totalAmountOnWorker} </span> KD
            </strong>
          </Typography>
          <Typography variant="h4" color="secondary" mt={4}>
            Total amount on company:
            <strong>
              <span> {totalAmountOnCompany} </span> KD
            </strong>
          </Typography>
        </Box>
      </Box>
      <Box
        display="grid"
        gap="30px"
        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        sx={{
          "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
        }}
      ></Box>
    </Box>
  );
};

export default PettyCash;
