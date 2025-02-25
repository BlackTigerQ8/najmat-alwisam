import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Backdrop,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
import * as XLSX from "xlsx";
import SaveIcon from "@mui/icons-material/Save";
import { useSelector, useDispatch } from "react-redux";
import { fetchDrivers } from "../redux/driversSlice";
import { pulsar } from "ldrs";
import {
  fetchInvoices,
  createDriverInvoice,
  fetchEmployeeInvoices,
  resetDriverInvoices,
  resetSingleDriverInvoice,
  restoreDriverInvoices,
} from "../redux/invoiceSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import {
  buildInvoiceActionNotification,
  createNotification,
} from "../redux/notificationSlice";

const InvoicesArchive = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userInfo = useSelector((state) => state.user.userInfo);
  const drivers = useSelector((state) => state.drivers.drivers);
  const status = useSelector((state) => state.drivers.status);
  const error = useSelector((state) => state.drivers.error);
  const token =
    useSelector((state) => state.drivers.token) ||
    localStorage.getItem("token");

  const invoices = useSelector((state) => state.invoice?.driverInvoices || []);
  const [openModal, setOpenModal] = useState(false);
  const [openRestoreModal, setOpenRestoreModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rowModifications, setRowModifications] = useState({});
  const [editedRows, setEditedRows] = useState({});

  const getInvoiceData = useCallback(
    (driverId) => {
      const driverInvoices = invoices.filter(
        (invoice) => invoice.driver && invoice.driver._id === driverId
      );

      return driverInvoices.reduce((result, invoice) => {
        result.mainOrder = invoice.mainOrder + (result.mainOrder || 0);
        result.additionalOrder =
          invoice.additionalOrder + (result.additionalOrder || 0);
        result.hour = invoice.hour + (result.hour || 0);
        result.cash = invoice.cash + (result.cash || 0);
        result.additionalSalary =
          invoice.additionalSalary + (result.additionalSalary || 0);
        result.deductionAmount =
          (invoice.deductionAmount || 0) + (result.deductionAmount || 0);

        if (
          invoice.mainOrder ||
          invoice.additionalOrder ||
          invoice.hour ||
          invoice.cash
        ) {
          result.invoiceDate = invoice.invoiceDate;
        }

        return result;
      }, {});
    },
    [invoices]
  );

  const driverWithInvoices = useMemo(() => {
    if (!drivers || !invoices) return [];

    return drivers
      .map((driver) => {
        if (!driver || !driver._id) return null;
        const { cash, hour, mainOrder, additionalOrder, invoiceDate } =
          getInvoiceData(driver._id);

        return {
          ...driver,
          cash: cash ? cash.toFixed(3) : cash,
          hour,
          mainOrder,
          additionalOrder,
          invoiceDate,
        };
      })
      .filter(Boolean);
  }, [drivers, getInvoiceData]);

  const [editRowsModel, setEditRowsModel] = useState({});

  const resetInvoices = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleConfirmReset = async () => {
    try {
      setIsLoading(true);
      setOpenModal(false);

      // Reset the invoices
      const result = await dispatch(resetDriverInvoices()).unwrap();

      // Create notification
      const notificationData = buildInvoiceActionNotification({
        actionType: "reset",
        userRole: userInfo.role, // Make sure you have access to the user object
        userName: `${userInfo.firstName} ${userInfo.lastName}`,
      });

      await dispatch(createNotification({ values: notificationData }));

      // The table should now be empty since all invoices are archived
      // Fetch only visibleToAll invoices
      await dispatch(fetchInvoices(token));

      // Clear local state
      setRowModifications({});
      setEditedRows({});
      setEditRowsModel({});
    } catch (error) {
      console.error("Error resetting invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleRestore = useCallback(() => {
    setOpenRestoreModal(true);
  }, []);

  const handleConfirmRestore = () => {
    setIsLoading(true);
    setOpenRestoreModal(false);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    dispatch(restoreDriverInvoices({ startDate, endDate }))
      .unwrap()
      .then(async () => {
        // Create notification
        const notificationData = buildInvoiceActionNotification({
          actionType: "restore",
          userRole: userInfo.role,
          userName: `${userInfo.firstName} ${userInfo.lastName}`,
        });

        await dispatch(createNotification({ values: notificationData }));

        setOpenRestoreModal(false);
      })
      .catch((error) => {
        console.error("Error restoring invoices:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleCloseRestoreModal = () => {
    setOpenRestoreModal(false);
  };

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

        // Process and upload each row
        for (const row of jsonData) {
          // Extract driverId from the "Driver ID (DO NOT EDIT)" column
          const driverId = row["Driver ID (DO NOT EDIT)"] || row["driverId"];

          if (!driverId) {
            console.log("Skipping row - no driverId:", row);
            continue;
          }

          // Parse and format the date correctly
          let formattedDate;
          if (row.invoiceDate) {
            try {
              // Check if the date is a string that needs splitting
              if (
                typeof row.invoiceDate === "string" &&
                row.invoiceDate.includes("/")
              ) {
                const [month, day, year] = row.invoiceDate.split("/");
                formattedDate = `${year}-${month.padStart(
                  2,
                  "0"
                )}-${day.padStart(2, "0")}`;
              }
              // Handle Excel date (which might be a number)
              else if (typeof row.invoiceDate === "number") {
                // Convert Excel date number to JS Date
                const excelDate = new Date(
                  Math.round((row.invoiceDate - 25569) * 86400 * 1000)
                );
                formattedDate = excelDate.toISOString().split("T")[0];
              }
              // If it's already in YYYY-MM-DD format
              else if (
                typeof row.invoiceDate === "string" &&
                row.invoiceDate.includes("-")
              ) {
                formattedDate = row.invoiceDate;
              } else {
                // Default to today's date if format is unrecognized
                formattedDate = new Date().toISOString().split("T")[0];
              }
            } catch (error) {
              console.error("Date parsing error:", error, row.invoiceDate);
              formattedDate = new Date().toISOString().split("T")[0];
            }
          } else {
            formattedDate = new Date().toISOString().split("T")[0];
          }

          console.log("Processing row:", {
            driverId,
            cash: row.cash,
            mainOrder: row.mainOrder,
            additionalOrder: row.additionalOrder,
            hour: row.hour,
            invoiceDate: formattedDate,
          });

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
              createDriverInvoice(invoiceData)
            ).unwrap();
            console.log("Invoice created:", response);
          } catch (error) {
            console.error(
              `Error uploading invoice for driver ${driverId}:`,
              error
            );
            toast.error(`Failed to upload invoice for driver ${driverId}`);
          }
        }

        // Refresh the data
        await dispatch(fetchInvoices(token));
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

  const downloadExcelTemplate = () => {
    const driversList = drivers.map((driver) => ({
      "Driver Name (DO NOT EDIT)": `${driver.firstName} ${driver.lastName}`,
      "Driver ID (DO NOT EDIT)": driver._id,
      cash: 0,
      mainOrder: 0,
      additionalOrder: 0,
      hour: 0,
      invoiceDate: "MM/DD/YYYY",
    }));

    const ws = XLSX.utils.json_to_sheet(driversList);

    // Set column widths
    ws["!cols"] = [
      { wch: 25 }, // Driver Name
      { wch: 25 }, // Driver ID
      { wch: 10 }, // cash
      { wch: 10 }, // mainOrder
      { wch: 15 }, // additionalOrder
      { wch: 10 }, // hour
      { wch: 12 }, // invoiceDate
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice Template");
    XLSX.writeFile(wb, "invoice_template.xlsx");
  };

  const columns = [
    {
      field: "sequenceNumber",
      headerName: "NO.",
    },

    {
      field: "name",
      headerName: t("name"),
      flex: 1,
      cellClassName: "name-column--cell",
      renderCell: ({ row: { firstName, lastName } }) => {
        return (
          <Box display="flex" justifyContent="center" borderRadius="4px">
            {firstName} {lastName}
          </Box>
        );
      },
    },
    {
      field: "phone",
      headerName: t("phone"),
      flex: 1,
    },
    {
      field: "idNumber",
      headerName: t("idNumber"),
      type: Number,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "cash",
      headerName: t("cash"),
      editable: true,
      type: Number,
    },
    {
      field: "hour",
      headerName: t("hours"),
      editable: true,
    },
    {
      field: "mainOrder",
      headerName: t("mainOrders"),
      editable: true,
    },
    {
      field: "additionalOrder",
      headerName: t("additionalOrders"),
      editable: true,
    },
    {
      field: "invoiceDate",
      headerName: t("date"),
      headerAlign: "center",
      align: "center",
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
      field: "actions",
      headerName: t("actions"),
      flex: 1.5,
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
              onClick={() => handleUpdate(params.row)}
              disabled={!hasChanges}
            >
              {t("save")}
            </Button>
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          dispatch(fetchDrivers(token)),
          dispatch(fetchInvoices(token)),
          dispatch(fetchEmployeeInvoices(token)),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, dispatch]);

  // Socket listener for real-time updates
  useEffect(() => {
    // Create socket connection with explicit namespace and full URL
    const socket = io(`${process.env.REACT_APP_API_URL}/invoices`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socket.on("connect", () => {
      console.log("Socket connected to invoices namespace");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("invoicesReset", async () => {
      try {
        const token = localStorage.getItem("token");
        await dispatch(fetchInvoices(token)).unwrap();
        toast.info(t("invoicesResetByOtherUser"));
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    });

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("connect_error");
        socket.off("invoicesReset");
        socket.disconnect();
      }
    };
  }, [dispatch, t]);

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

  // Add error handler
  const handleProcessRowUpdateError = (error) => {
    console.error(error);
  };

  const handleUpdate = (row) => {
    setIsLoading(true);
    try {
      const modifications = rowModifications[row._id];

      if (!modifications || Object.keys(modifications).length === 0) {
        return;
      }

      const formData = new FormData();

      // Only append modified fields
      if ("cash" in modifications) {
        formData.append("cash", modifications.cash || 0);
      }
      if ("mainOrder" in modifications) {
        formData.append("mainOrder", modifications.mainOrder || 0);
      }
      if ("additionalOrder" in modifications) {
        formData.append("additionalOrder", modifications.additionalOrder || 0);
      }
      if ("hour" in modifications) {
        formData.append("hour", modifications.hour || 0);
      }
      formData.append("driverId", row._id);

      dispatch(createDriverInvoice(formData));

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
      console.error("Error updating row:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (driverId) => {
    try {
      dispatch(resetSingleDriverInvoice({ params: { driverId } }));
    } catch (error) {
      console.error("Error resetting driver");
    }
  };

  // Add this modal component before the return statement
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
          {t("confirmReset")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography color={colors.grey[100]}>
          {t("confirmResetMessage")}
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
          onClick={handleConfirmReset}
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

  const RestoreConfirmationModal = () => (
    <Dialog
      open={openRestoreModal}
      onClose={handleCloseRestoreModal}
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
          {t("confirmRestore")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography color={colors.grey[100]}>
          {t("confirmRestoreMessage")}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: "20px" }}>
        <Button
          onClick={handleCloseRestoreModal}
          variant="contained"
          sx={{
            backgroundColor: colors.grey[500],
            "&:hover": { backgroundColor: colors.grey[400] },
          }}
        >
          {t("cancel")}
        </Button>
        <Button
          onClick={handleConfirmRestore}
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

  return (
    <Box m="20px">
      <RestoreConfirmationModal />
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
        open={isLoading}
      >
        <l-pulsar
          size="70"
          speed="1.75"
          color={colors.greenAccent[500]}
        ></l-pulsar>
      </Backdrop>
      <ConfirmationModal />
      <Header title={t("invoicesTitle")} subtitle={t("invoicesSubtitle")} />
      <Box
        display="flex"
        justifyContent="flex-end"
        sx={{
          "& > div": { gridColumn: isNonMobile ? undefined : "span 5" },
          gap: "10px",
        }}
      >
        <Button onClick={resetInvoices} color="secondary" variant="contained">
          {t("reset")}
        </Button>
        <Button
          onClick={handleRestore}
          color="secondary"
          variant="contained"
          startIcon={<RestoreIcon />}
        >
          {t("restore")}
        </Button>
        <input
          type="file"
          accept=".xlsx, .xls"
          style={{ display: "none" }}
          id="excel-upload"
          onChange={handleFileUpload}
        />
        <label htmlFor="excel-upload">
          <Button
            component="span"
            color="secondary"
            variant="contained"
            startIcon={<UploadIcon />}
          >
            {t("uploadExcel")}
          </Button>
        </label>
        <Button
          color="secondary"
          variant="outlined"
          onClick={downloadExcelTemplate}
          startIcon={<DownloadIcon />}
        >
          {t("downloadTemplate")}
        </Button>
      </Box>
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
          rows={Array.isArray(driverWithInvoices) ? driverWithInvoices : []}
          columns={columns}
          getRowId={(row) => row._id}
          editMode="cell"
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          experimentalFeatures={{ newEditingApi: true }}
        />
      </Box>
    </Box>
  );
};

export default InvoicesArchive;
