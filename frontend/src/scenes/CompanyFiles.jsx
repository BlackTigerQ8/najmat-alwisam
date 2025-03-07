import React, { useEffect, useState } from "react";
import * as yup from "yup";
import {
  Box,
  useTheme,
  Button,
  FormControl,
  InputLabel,
  Input,
  Typography,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { ErrorMessage, Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { tokens } from "../theme";
import { useSelector, useDispatch } from "react-redux";
import { pulsar } from "ldrs";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
// import EditIcon from "@mui/icons-material/Edit";
import {
  fetchAllCompanyFiles,
  addCompanyFiles,
  deleteCompanyFile,
  editCompanyFiles,
} from "../redux/companyFilesSlice";
import { useTranslation } from "react-i18next";

const initialValues = {
  uploadedFile: null,
};

const companyFilesSchema = yup.object().shape({
  uploadedFile: yup.mixed().required("File is required"),
});

const CompanyFiles = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const status = useSelector((state) => state.companyFiles.status);
  const error = useSelector((state) => state.companyFiles.error);
  const companyFiles =
    useSelector((state) => state.companyFiles.companyFiles) || [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const token = localStorage.getItem("token");

  async function handleFormSubmit(values, { resetForm }) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("uploadedFile", values.uploadedFile);
      dispatch(addCompanyFiles(formData));
      resetForm();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    dispatch(fetchAllCompanyFiles(token));
  }, [dispatch, token]);

  const columns = [
    {
      field: "name",
      headerName: t("fileName"),
      flex: 1,
      editable: true,
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
            {/* <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginRight: 8 }}
              onClick={() => handleUpdate(params.row)}
              startIcon={<EditIcon />}
            ></Button> */}
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

  const handleUpdate = ({ _id, name }) => {
    try {
      dispatch(
        editCompanyFiles({
          values: { newName: name },
          id: _id,
        })
      );
    } catch (error) {
      console.error("Row does not have a valid _id field:");
    }
  };

  const handleViewFile = (values) => {
    const fileUrl = values?.filePath
      ? `${process.env.REACT_APP_API_URL}/${values?.filePath}`
      : null;

    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const handleDelete = (companyFileId) => {
    setFileToDelete(companyFileId);
    setOpenModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteCompanyFile(fileToDelete));
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setOpenModal(false);
      setFileToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFileToDelete(null);
  };

  // Add ConfirmationModal component
  const ConfirmationModal = () => (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      PaperProps={{
        style: {
          backgroundColor: colors.primary[400],
          border: `1px solid ${colors.primary[500]}`,
          borderRadius: "4px",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h4" color={colors.grey[100]}>
          {t("confirmDelete")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography color={colors.grey[100]}>
          {t("confirmDeleteMessage")}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: "20px" }}>
        <Button
          onClick={handleCloseModal}
          variant="contained"
          sx={{
            backgroundColor: colors.grey[500],
            "&:hover": { backgroundColor: colors.grey[400] },
          }}
        >
          {t("cancel")}
        </Button>
        <Button
          onClick={handleConfirmDelete}
          variant="contained"
          color="secondary"
          sx={{
            marginLeft: "10px",
            backgroundColor: colors.greenAccent[500],
            "&:hover": { backgroundColor: colors.greenAccent[400] },
          }}
        >
          {t("confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );

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
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
        open={isSubmitting}
      >
        <l-pulsar
          size="70"
          speed="1.75"
          color={colors.greenAccent[500]}
        ></l-pulsar>
      </Backdrop>
      <ConfirmationModal />
      <Header title={t("companyFiles")} subtitle={t("companyFilesSubtitle")} />
      <Formik
        initialValues={initialValues}
        validationSchema={companyFilesSchema}
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
          resetForm,
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
              <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                <InputLabel shrink htmlFor="uploadedFile">
                  {t("uploadFile")}
                </InputLabel>
                <Input
                  id="uploadedFile"
                  type="file"
                  name="uploadedFile"
                  onBlur={handleBlur}
                  onChange={(event) => {
                    // Setting file to Formik state
                    setFieldValue("uploadedFile", event.currentTarget.files[0]);
                  }}
                  error={!!touched.uploadedFile && !!errors.uploadedFile}
                  helperText={touched.uploadedFile && errors.uploadedFile}
                />
                <ErrorMessage
                  name="uploadedFile"
                  render={(msg) => (
                    <Typography variant="caption" color="error">
                      {msg}
                    </Typography>
                  )}
                />
              </FormControl>
              <Button type="submit" color="secondary" variant="contained">
                {t("uploadNewFile")}
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
          rows={companyFiles}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default CompanyFiles;
