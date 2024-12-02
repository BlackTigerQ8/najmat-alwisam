import React, { useEffect } from "react";
import { Alert, Box, Button, useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { DataGrid } from "@mui/x-data-grid";
import { fetchArchives } from "../redux/archiveSlice";

const SearchArchive = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const { status, error, archives } = useSelector((state) => state.archive);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();

  useEffect(() => {
    // Dispatch the action to fetch archives when the component mounts
    dispatch(fetchArchives());
  }, [dispatch]);

  const handleViewFile = (values) => {
    const fileUrl = values?.file
      ? `${process.env.REACT_APP_API_URL}/${values?.file}`
      : null;

    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "NO.",
    },
    {
      field: "fullName",
      headerName: t("fullName"),
    },
    {
      field: "company",
      headerName: t("company"),
    },
    {
      field: "idNumber",
      headerName: t("idNumber"),
      type: Number,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "vehicle",
      headerName: t("vehicle"),
    },
    {
      field: "workNumber",
      headerName: t("workNumber"),
    },
    {
      field: "archiveNumber",
      headerName: t("archiveNumber"),
    },
    {
      field: "preview",
      headerName: t("preview"),
      width: 150,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (!params.row.file) return null;
        return (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleViewFile(params.row)}
          >
            <RemoveRedEyeOutlinedIcon />
          </Button>
        );
      },
    },
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

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box m="20px">
      <Header
        title={t("searchArchiveTitle")}
        subtitle={t("searchArchiveSubtitle")}
      />
      <Box
        mt="40px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
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
          rows={Array.isArray(archives) ? archives : []}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default SearchArchive;
