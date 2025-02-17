import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Select,
  useTheme,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import InfoIcon from "@mui/icons-material/Info";
import { DataGrid, useGridApiContext } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
import { useSelector, useDispatch } from "react-redux";
import { fetchDrivers } from "../redux/driversSlice";
import { pulsar } from "ldrs";
import useMediaQuery from "@mui/material/useMediaQuery";
import * as yup from "yup";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/Upload";
import * as XLSX from "xlsx";
import {
  createArchivedDriverInvoice,
  fetchArchivedInvoices,
  fetchEmployeeInvoices,
  searchArchivedInvoices,
  updateInvoiceDetails,
} from "../redux/invoiceSlice";
import { Formik } from "formik";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { format } from "date-fns";

const initialValues = {
  startDate: "",
  endDate: "",
  selectedDriver: [],
};

const searchSchema = yup.object().shape({
  startDate: yup.string().required("Select starting date"),
  endDate: yup.string().required("Select ending date"),
});

const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const drivers = useSelector((state) => state.drivers.drivers);
  const status = useSelector((state) => state.drivers.status);
  const error = useSelector((state) => state.drivers.error);
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");

  // const invoices = useSelector(
  //   (state) => state.invoice?.archivedDriverInvoices || []
  // );
  const archivedInvoices = useSelector(
    (state) => state.invoice.archivedDriverInvoices || []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [editRowsModel, setEditRowsModel] = useState({});
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchParams, setSearchParams] = useState({
    startDate: "",
    endDate: "",
    driverIds: [],
  });
  const [modalEditRowsModel, setModalEditRowsModel] = useState({});
  const [rowModifications, setRowModifications] = useState({});
  const [editedRows, setEditedRows] = useState({});

  const processedData = useMemo(() => {
    // Add defensive check for archivedInvoices
    if (!archivedInvoices) {
      console.log("archivedInvoices is undefined");
      return [];
    }

    console.log("Raw archived invoices:", archivedInvoices);
    console.log("Search state:", { isSearchActive, searchParams });

    if (!Array.isArray(archivedInvoices) || archivedInvoices.length === 0) {
      console.log("archivedInvoices is not an array or is empty");
      return [];
    }

    // If search is active, group the data by driver
    if (isSearchActive) {
      // First, ensure we have the correct data structure
      const validInvoices = archivedInvoices.filter(
        (invoice) => invoice && invoice.driver && invoice.driver._id
      );

      // Group by driver
      const groupedByDriver = validInvoices.reduce((acc, invoice) => {
        const driverId = invoice.driver._id;

        if (!acc[driverId]) {
          acc[driverId] = {
            _id: driverId,
            firstName: invoice.driver.firstName || "",
            lastName: invoice.driver.lastName || "",
            mainOrder: 0,
            additionalOrder: 0,
            hour: 0,
            cash: 0,
            details: [],
            hasMultipleEntries: true,
            isGrouped: true,
          };
        }

        // Add up the numeric values with default to 0 if undefined
        acc[driverId].mainOrder += Number(invoice.mainOrder) || 0;
        acc[driverId].additionalOrder += Number(invoice.additionalOrder) || 0;
        acc[driverId].hour += Number(invoice.hour) || 0;
        acc[driverId].cash += Number(invoice.cash) || 0;
        acc[driverId].details.push({
          ...invoice,
          mainOrder: Number(invoice.mainOrder) || 0,
          additionalOrder: Number(invoice.additionalOrder) || 0,
          hour: Number(invoice.hour) || 0,
          cash: Number(invoice.cash) || 0,
        });

        return acc;
      }, {});

      return Object.values(groupedByDriver);
    }

    // For non-search view, group by date
    const groupedByDate = archivedInvoices.reduce((acc, invoice) => {
      if (!invoice || !invoice.invoiceDate) {
        return acc;
      }

      const date = new Date(invoice.invoiceDate);
      const dateKey = date.toISOString().split("T")[0];

      if (!acc[dateKey]) {
        acc[dateKey] = {
          _id: dateKey,
          invoiceDate: date,
          mainOrder: 0,
          additionalOrder: 0,
          hour: 0,
          cash: 0,
          details: [],
          hasMultipleEntries: true,
          isGrouped: true,
        };
      }

      // Add up the numeric values with default to 0 if undefined
      acc[dateKey].mainOrder += Number(invoice.mainOrder) || 0;
      acc[dateKey].additionalOrder += Number(invoice.additionalOrder) || 0;
      acc[dateKey].hour += Number(invoice.hour) || 0;
      acc[dateKey].cash += Number(invoice.cash) || 0;
      acc[dateKey].details.push({
        ...invoice,
        mainOrder: Number(invoice.mainOrder) || 0,
        additionalOrder: Number(invoice.additionalOrder) || 0,
        hour: Number(invoice.hour) || 0,
        cash: Number(invoice.cash) || 0,
      });

      return acc;
    }, {});

    // Convert to array and sort by date (newest first)
    return Object.values(groupedByDate).sort(
      (a, b) => b.invoiceDate - a.invoiceDate
    );
  }, [archivedInvoices, isSearchActive, searchParams]);

  // Add this useEffect to debug the processed data
  useEffect(() => {
    console.log("Final processed data:", processedData);
  }, [processedData]);

  // Add this useEffect to debug the processed data
  useEffect(() => {
    console.log("Final processed data:", processedData);
  }, [processedData]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: "sequenceNumber",
        headerName: "NO.",
        width: 70,
        renderCell: (params) => {
          const allRows = params.api.getRowModels();
          const rowIds = Array.from(allRows.keys());
          const index = rowIds.indexOf(params.id);
          return index + 1;
        },
      },
      {
        field: "invoiceDate",
        headerName: t("date"),
        headerAlign: "center",
        align: "center",
        flex: 1,
        valueFormatter: (params) => {
          if (!params.value) return "";
          const date = new Date(params.value);
          const formattedDate = `${date.getDate()}/${
            date.getMonth() + 1
          }/${date.getFullYear()}`;
          return formattedDate;
        },
      },
      {
        field: "cash",
        headerName: t("cash"),
        type: "number",
        flex: 1,
        headerAlign: "center",
        align: "center",
        valueFormatter: (params) => Number(params.value).toFixed(3),
      },
      {
        field: "hour",
        headerName: t("hours"),
        flex: 1,
        headerAlign: "center",
        align: "center",
      },
      {
        field: "mainOrder",
        headerName: t("mainOrders"),
        flex: 1,
        headerAlign: "center",
        align: "center",
      },
      {
        field: "additionalOrder",
        headerName: t("additionalOrders"),
        flex: 1,
        headerAlign: "center",
        align: "center",
      },

      {
        field: "actions",
        headerName: t("details"),
        flex: 1,
        headerAlign: "center",
        align: "center",
        renderCell: ({ row }) => {
          if (!row.hasMultipleEntries) return null;
          return (
            <IconButton size="small" onClick={() => handleRowClick(row)}>
              <InfoIcon />
            </IconButton>
          );
        },
      },
    ];

    // Only add the name column if in search mode
    if (isSearchActive) {
      baseColumns.splice(1, 0, {
        field: "name",
        headerName: t("name"),
        flex: 1,
        headerAlign: "center",
        align: "center",
        cellClassName: "name-column--cell",
        renderCell: ({ row }) => {
          // Access driver data from the row
          return (
            <Box display="flex" justifyContent="center" borderRadius="4px">
              {row.driver?.firstName || row.firstName}{" "}
              {row.driver?.lastName || row.lastName}
            </Box>
          );
        },
      });
    }

    return baseColumns;
  }, [isSearchActive, t]);

  const modalColumns = useMemo(
    () => [
      {
        field: "invoiceDate",
        headerName: t("date"),
        flex: 1,
        valueFormatter: (params) => {
          if (!params.value) return "";
          const date = new Date(params.value);
          const formattedDate = `${date.getDate()}/${
            date.getMonth() + 1
          }/${date.getFullYear()}`;
          return formattedDate;
        },
        editable: false,
      },
      {
        field: "name",
        headerName: t("driver"),
        flex: 1,
        headerAlign: "center",
        align: "center",
        renderCell: ({ row }) => {
          return (
            <Box display="flex" justifyContent="center" borderRadius="4px">
              {row.driver?.firstName || ""} {row.driver?.lastName || ""}
            </Box>
          );
        },
        editable: false,
      },
      {
        field: "cash",
        headerName: t("cash"),
        headerAlign: "center",
        align: "center",
        flex: 1,
        type: "number",
        valueFormatter: (params) => Number(params.value).toFixed(3),
        editable: true,
      },
      {
        field: "hour",
        headerName: t("hour"),
        flex: 1,
        headerAlign: "center",
        align: "center",
        type: "number",
        editable: true,
      },
      {
        field: "mainOrder",
        headerName: t("mainOrder"),
        flex: 1,
        headerAlign: "center",
        align: "center",
        type: "number",
        editable: true,
      },
      {
        field: "additionalOrder",
        headerName: t("additionalOrder"),
        flex: 1,
        headerAlign: "center",
        align: "center",
        type: "number",
        editable: true,
      },
      {
        field: "actions",
        headerName: t("actions"),
        flex: 1,
        headerAlign: "center",
        align: "center",
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const rowId = params.row._id;
          const hasChanges = Boolean(
            editedRows[rowId] && rowModifications[rowId]
          );

          return (
            <Box display="flex" gap={1}>
              <Button
                color="secondary"
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={() => handleModalCellEdit(params.row)}
                disabled={!hasChanges}
              >
                {t("save")}
              </Button>
            </Box>
          );
        },
      },
    ],
    [t, editedRows, rowModifications]
  );

  // Handle search form submission
  const handleFormSubmit = (values) => {
    // Ensure driverIds is an array and handle empty selection
    const driverIds = Array.isArray(values.selectedDriver)
      ? values.selectedDriver
      : values.selectedDriver
      ? [values.selectedDriver]
      : [];

    const searchData = {
      startDate: values.startDate,
      endDate: values.endDate,
      driverIds: driverIds,
    };

    console.log("Submitting search with:", searchData);

    // First set the search params
    setSearchParams(searchData);

    // Then dispatch the search
    dispatch(searchArchivedInvoices(searchData))
      .unwrap()
      .then((response) => {
        console.log("Search response received:", response);
        // Only set search active if we got valid results
        if (response.data?.driverInvoices?.length > 0) {
          setIsSearchActive(true);
        }
      })
      .catch((error) => {
        console.error("Search failed:", error);
        setIsSearchActive(false);
      });
  };

  const handleClearSearch = useCallback(() => {
    setIsSearchActive(false);
    setSearchParams({
      startDate: "",
      endDate: "",
      driverIds: [],
    });
    dispatch(fetchArchivedInvoices(localStorage.getItem("token")));
  }, [dispatch]);

  const handleRowClick = (row) => {
    setSelectedDriver(row);
    setModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchDrivers(token));
    dispatch(fetchArchivedInvoices(token));
    dispatch(fetchEmployeeInvoices(token));
  }, [token, dispatch]);

  const handleModalCellEdit = async (row) => {
    try {
      const modifications = rowModifications[row._id];

      if (!modifications || Object.keys(modifications).length === 0) {
        return;
      }

      await dispatch(
        updateInvoiceDetails({
          invoiceId: row._id,
          modifications,
        })
      ).unwrap();

      // Update the local state with the edited values
      const updatedDriver = { ...selectedDriver };
      const detailIndex = updatedDriver.details.findIndex(
        (d) => d._id === row._id
      );
      if (detailIndex !== -1) {
        updatedDriver.details[detailIndex] = {
          ...updatedDriver.details[detailIndex],
          ...modifications,
        };
        setSelectedDriver(updatedDriver);
      }

      // Clear modifications for this row
      setRowModifications((prev) => {
        const newState = { ...prev };
        delete newState[row._id];
        return newState;
      });

      setEditedRows((prev) => {
        const newState = { ...prev };
        delete newState[row._id];
        return newState;
      });
    } catch (error) {
      console.error("Error updating cell:", error);
    }
  };

  const processRowUpdate = (newRow, oldRow) => {
    const id = newRow._id;
    const changes = {};

    Object.keys(newRow).forEach((field) => {
      if (newRow[field] !== oldRow[field]) {
        changes[field] = newRow[field];
      }
    });

    if (Object.keys(changes).length > 0) {
      setRowModifications((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          ...changes,
        },
      }));

      setEditedRows((prev) => ({
        ...prev,
        [id]: true,
      }));
    }

    return newRow;
  };

  // Error handler
  const handleProcessRowUpdateError = (error) => {
    console.error("Error updating row:", error);
    toast.error(t("updateError"));
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

  function handleSubmit(values) {
    const searchData = {
      startDate: values.startDate,
      endDate: values.endDate,
      driverIds: values.selectedDriver, // This was using incorrect field name
    };

    console.log("selectedDriver", selectedDriver);

    // Set the search state
    setIsSearchActive(true);
    setSearchParams(searchData);

    // Dispatch the search action
    dispatch(searchArchivedInvoices(searchData));
  }

  const handleFileUpload = async (event) => {
    try {
      setIsLoading(true);
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log("Parsed Excel Data:", jsonData);

        // Process and upload each row
        for (const row of jsonData) {
          const driverId = row["Driver ID (DO NOT EDIT)"] || row["driverId"];

          if (!driverId) {
            console.log("Skipping row - no driverId:", row);
            continue;
          }

          // Parse and format the date from Excel
          let formattedDate;
          if (row.invoiceDate) {
            try {
              // Convert Excel serial number to date
              if (typeof row.invoiceDate === "number") {
                const excelEpoch = new Date(1899, 11, 30); // Excel's epoch starts from December 30, 1899
                const millisecondsPerDay = 24 * 60 * 60 * 1000;
                const date = new Date(
                  excelEpoch.getTime() + row.invoiceDate * millisecondsPerDay
                );
                formattedDate = date.toISOString().split("T")[0];
              }
              // Handle string date format
              else if (typeof row.invoiceDate === "string") {
                if (row.invoiceDate.includes("/")) {
                  const [month, day, year] = row.invoiceDate.split("/");
                  formattedDate = `${year}-${month.padStart(
                    2,
                    "0"
                  )}-${day.padStart(2, "0")}`;
                } else if (row.invoiceDate.includes("-")) {
                  formattedDate = row.invoiceDate;
                }
              }

              if (!formattedDate) {
                console.error("Could not parse date:", row.invoiceDate);
                continue;
              }

              console.log("Parsed date:", {
                original: row.invoiceDate,
                formatted: formattedDate,
              });
            } catch (error) {
              console.error("Date parsing error:", error, row.invoiceDate);
              continue;
            }
          } else {
            console.log("Skipping row - no date:", row);
            continue;
          }

          const invoiceData = new FormData();
          invoiceData.append("driverId", driverId.trim());
          invoiceData.append("cash", Number(row.cash) || 0);
          invoiceData.append("mainOrder", Number(row.mainOrder) || 0);
          invoiceData.append(
            "additionalOrder",
            Number(row.additionalOrder) || 0
          );
          invoiceData.append("hour", Number(row.hour) || 0);
          invoiceData.append("invoiceDate", formattedDate);

          try {
            const response = await dispatch(
              createArchivedDriverInvoice(invoiceData)
            ).unwrap();
            console.log("Archived invoice created:", response);
          } catch (error) {
            console.error(
              `Error uploading archived invoice for driver ${driverId}:`,
              error
            );
            toast.error(
              `Failed to upload archived invoice for driver ${driverId}`
            );
          }
        }

        // Refresh the archived invoices data
        await dispatch(fetchArchivedInvoices(token));
        toast.success(t("excelUploadSuccess"));
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error uploading excel:", error);
      toast.error(t("excelUploadError"));
    } finally {
      setIsLoading(false);
      event.target.value = ""; // Reset file input
    }
  };

  return (
    <Box m="20px">
      <Header
        title={t("invoicesArchive")}
        subtitle={t("invoicesArchiveSubtitle")}
      />
      <Formik
        initialValues={initialValues}
        validationSchema={searchSchema}
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
                type="date"
                label={t("startingDate")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.startDate}
                name="startDate"
                error={!!touched.startDate && !!errors.startDate}
                helperText={touched.startDate && errors.startDate}
                sx={{ gridColumn: "span 1" }}
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
              />
              <FormControl
                fullWidth
                sx={{ gridColumn: "span 2", position: "relative" }}
              >
                <InputLabel id="select-driver-label">
                  {t("selectDriver")}
                </InputLabel>
                <Select
                  labelId="select-driver-label"
                  id="select-drivers"
                  multiple
                  value={values.selectedDriver || []}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.selectedDriver && !!errors.selectedDriver}
                  name="selectedDriver"
                  label="Select Drivers"
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver._id} value={driver._id}>
                      {driver.firstName} {driver.lastName}
                    </MenuItem>
                  ))}
                </Select>
                {values.selectedDriver.length > 0 && (
                  <IconButton
                    onClick={() => setFieldValue("selectedDriver", [])}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "8px",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                )}
              </FormControl>

              <Box display="flex" gap="10px">
                <Button type="submit" color="secondary" variant="contained">
                  {t("search")}
                </Button>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  style={{ display: "none" }}
                  id="archive-excel-upload"
                  onChange={handleFileUpload}
                />
                <label htmlFor="archive-excel-upload">
                  <Button
                    component="span"
                    color="secondary"
                    variant="contained"
                    startIcon={<UploadIcon />}
                  >
                    {t("uploadExcel")}
                  </Button>
                </label>
                {isSearchActive && (
                  <Button
                    onClick={handleClearSearch}
                    color="primary"
                    variant="outlined"
                  >
                    {t("clear")}
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        )}
      </Formik>

      <Box
        mt="40px"
        height="75vh"
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          // checkboxSelection
          // rows={Array.isArray(driverWithInvoices) ? driverWithInvoices : []}
          rows={processedData}
          columns={columns}
          getRowId={(row) => row._id || `${row.driverId}-${Math.random()}`}
          editRowsModel={editRowsModel}
          onEditRowsModelChange={(newModel) => setEditRowsModel(newModel)}
          sx={{
            "& .grouped-row": {
              backgroundColor: colors.blueAccent[900],
              "&:hover": {
                backgroundColor: colors.blueAccent[800],
              },
            },
          }}
          getRowClassName={(params) =>
            params.row.isGrouped ? "grouped-row" : ""
          }
        />
      </Box>

      {/* Details Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="driver-details"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxHeight: "80vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            overflow: "auto",
          }}
        >
          {selectedDriver && (
            <>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  color: colors.greenAccent[500],
                  fontWeight: "bold",
                  textAlign: "center",
                }}
                gutterBottom
              >
                {`${t("invoiceDetailsByDate")}: ${
                  selectedDriver.invoiceDate
                    ? format(new Date(selectedDriver.invoiceDate), "dd-MM-yyyy")
                    : ""
                }`}
              </Typography>
              <DataGrid
                rows={selectedDriver.details}
                columns={modalColumns}
                getRowId={(row) => row._id}
                autoHeight
                pageSize={5}
                editMode="cell"
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={handleProcessRowUpdateError}
                experimentalFeatures={{ newEditingApi: true }}
                sx={{
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
                  "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                    color: `${colors.grey[100]} !important`,
                  },
                }}
              />
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                  onClick={() => setModalOpen(false)}
                  color="secondary"
                  variant="contained"
                >
                  {t("close")}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Invoices;
