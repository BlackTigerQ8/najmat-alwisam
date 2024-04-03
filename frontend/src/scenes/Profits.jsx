import React from "react";
import { Box, useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { tokens } from "../theme";
import { pulsar } from "ldrs";

const Profits = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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

  const columns1 = [
    {
      field: "name",
      headerName: "Spends Type",
      flex: 1,
    },
    ...months.map((month) => ({
      field: `cashAmount${month}`,
      headerName: month,
      flex: 0.75,
    })),
    {
      field: "totalSpends",
      headerName: "Total",
      flex: 1,
    },
  ];

  pulsar.register();
  if ("status" === "loading") {
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

  if ("status" === "failed") {
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
        Error: {"error"}
      </div>
    );
  }

  return (
    <Box m="20px">
      <Header title="PETTY CASH" subtitle="Petty Cash Page" />
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
        <DataGrid rows={4} columns={columns1} getRowId={(row) => row._id} />
      </Box>
    </Box>
  );
};

export default Profits;
