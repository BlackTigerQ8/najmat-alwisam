import React, { useEffect } from "react";
import * as yup from "yup";
import { Box, useTheme, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { tokens } from "../theme";
import { useSelector, useDispatch } from "react-redux";
import { pulsar } from "ldrs";
import { fetchAllSpendTypes, addSpendType } from "../redux/spendTypeSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteSpendType } from "../redux/spendTypeSlice";
import { useTranslation } from "react-i18next";

const initialValues = {
  name: "",
};

const spendTypeSchema = yup.object().shape({
  name: yup.string().required(),
});

const SpendType = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const status = useSelector((state) => state.spendType.status);
  const error = useSelector((state) => state.spendType.error);
  const spendTypes = useSelector((state) => state.spendType.spendTypes);

  const token = localStorage.getItem("token");

  async function handleFormSubmit(values) {
    try {
      dispatch(addSpendType(values));
    } catch (error) {
      console.error("Row does not have a valid _id field:");
    }
  }

  useEffect(() => {
    dispatch(fetchAllSpendTypes(token));
  }, [dispatch, token]);

  const columns = [
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
    },
    {
      field: "actions",
      headerName: t("actions"),
      width: 150,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleDelete(params.row._id)}
              startIcon={<DeleteIcon />}
            ></Button>
          </Box>
        );
      },
    },
  ];

  const handleDelete = async (spendTypeId) => {
    try {
      dispatch(deleteSpendType(spendTypeId));
    } catch (error) {
      console.error("Error deleting spend type:", error);
    }
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
      <Header title={t("spendTypesTitle")} subtitle={t("spendTypesSubtitle")} />
      <Formik
        initialValues={initialValues}
        validationSchema={spendTypeSchema}
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
                type="text"
                label={t("name")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{ gridColumn: "span 1" }}
              />

              <Button type="submit" color="secondary" variant="contained">
                {t("addNewSpendType")}
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
          rows={spendTypes}
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
        ></Box>
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

export default SpendType;
