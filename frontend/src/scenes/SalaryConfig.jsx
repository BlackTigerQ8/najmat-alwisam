import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Checkbox,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  useTheme,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { tokens } from "../theme";
import {
  fetchSalaryConfigs,
  updateSalaryConfig,
} from "../redux/salaryConfigSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { pulsar } from "ldrs";
import Header from "../components/Header";
import { deleteSalaryConfig } from "../redux/salaryConfigSlice";
import { createSalaryConfig } from "../redux/salaryConfigSlice";
import { toast } from "react-toastify";

const SalaryConfig = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [selectedVehicle, setSelectedVehicle] = useState("Car");
  const [rules, setRules] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { configs, status, error } = useSelector((state) => state.salaryConfig);

  const dispatchToast = (message, type) => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  useEffect(() => {
    dispatch(fetchSalaryConfigs());
  }, [dispatch]);

  useEffect(() => {
    const config = configs?.find((c) => c.vehicleType === selectedVehicle);
    if (config && config.rules) {
      setRules(
        config.rules.map((rule) => ({
          ...rule,
          id: Math.random().toString(36).substr(2, 9),
        }))
      );
    } else {
      setRules([]);
    }
  }, [selectedVehicle, configs]);

  const columns = [
    {
      field: "minOrders",
      headerName: t("minimumOrders"),
      type: "number",
      editable: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "maxOrders",
      headerName: t("maximumOrders"),
      type: "number",
      editable: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (params) => {
        return params.value === Infinity ? "∞" : params.value;
      },
    },
    {
      field: "multiplier",
      headerName: t("multiplier"),
      type: "number",
      editable: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "fixedAmount",
      headerName: t("fixedAmount"),
      type: "number",
      editable: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "applyToMainOrdersOnly",
      headerName: t("applyToMainOrdersOnly"),
      type: "boolean",
      editable: true,
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Checkbox
          sx={{
            "&.Mui-checked": {
              color: colors.primary[100],
            },
          }}
          checked={params.row.applyToMainOrdersOnly}
          onChange={(e) => handleCellEdit(params)}
        />
      ),
    },
    {
      field: "actions",
      headerName: t("actions"),
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton
          onClick={() => handleDeleteRule(params.row.id)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const processRowUpdate = (newRow, oldRow) => {
    const updatedRow = {
      ...newRow,
      maxOrders: newRow.maxOrders === "∞" ? Infinity : Number(newRow.maxOrders),
      minOrders: Number(newRow.minOrders),
      multiplier: Number(newRow.multiplier),
      fixedAmount: Number(newRow.fixedAmount),
      applyToMainOrdersOnly: Boolean(newRow.applyToMainOrdersOnly),
    };

    const updatedRules = rules.map((rule) =>
      rule.id === newRow.id ? updatedRow : rule
    );

    setRules(updatedRules);
    return updatedRow;
  };

  const handleProcessRowUpdateError = (error) => {
    console.error("Error updating row:", error);
    dispatchToast(t("updateError"), "error");
  };

  const handleDeleteRule = async (id) => {
    setRuleToDelete(id);
    setOpenModal(true);
  };

  const handleAddRule = () => {
    const newRule = {
      id: Date.now().toString(),
      minOrders: 0,
      maxOrders: 0,
      multiplier: 0,
      fixedAmount: 0,
      applyToMainOrdersOnly: false,
    };
    setRules([...rules, newRule]);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      const updatedRules = rules.filter((rule) => rule.id !== ruleToDelete);
      setRules(updatedRules);

      if (updatedRules.length === 0) {
        await dispatch(deleteSalaryConfig(selectedVehicle)).unwrap();
      } else {
        const rulesWithoutIds = updatedRules.map(({ id, ...rule }) => ({
          minOrders: Number(rule.minOrders),
          maxOrders:
            rule.maxOrders === Infinity ? Infinity : Number(rule.maxOrders),
          multiplier: Number(rule.multiplier),
          fixedAmount: Number(rule.fixedAmount),
        }));

        await dispatch(
          updateSalaryConfig({
            vehicleType: selectedVehicle,
            rules: rulesWithoutIds,
          })
        ).unwrap();
      }

      // Refresh the data
      dispatch(fetchSalaryConfigs());
    } catch (error) {
      console.error("Error deleting rule:", error);
    } finally {
      setIsSubmitting(false);
      setOpenModal(false);
      setRuleToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setRuleToDelete(null);
  };

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

  const handleCellEdit = (params) => {
    const { id, field, value } = params;
    const updatedRules = rules.map((rule) => {
      if (rule.id === id) {
        return {
          ...rule,
          [field]:
            field === "maxOrders" && (value === "∞" || value === "Infinity")
              ? Infinity
              : Number(value),
        };
      }
      return rule;
    });
    setRules(updatedRules);
  };

  const validateRules = (rulesToValidate) => {
    // Sort rules by minOrders
    const sortedRules = [...rulesToValidate].sort(
      (a, b) => a.minOrders - b.minOrders
    );

    // Check each rule has valid numbers
    for (const rule of sortedRules) {
      if (
        isNaN(rule.minOrders) ||
        isNaN(rule.maxOrders) ||
        isNaN(rule.multiplier) ||
        isNaN(rule.fixedAmount)
      ) {
        console.log("Invalid number found in rule:", rule);
        return false;
      }
    }

    // Check for gaps and overlaps
    for (let i = 0; i < sortedRules.length - 1; i++) {
      //   const currentRule = sortedRules[i];
      //   const nextRule = sortedRules[i + 1];

      // Check for gaps and overlaps
      for (let i = 0; i < sortedRules.length - 1; i++) {
        const currentRule = sortedRules[i];
        const nextRule = sortedRules[i + 1];

        if (currentRule.maxOrders >= nextRule.minOrders) {
          toast.error(
            t("overlapError", {
              rule1: `${currentRule.minOrders}-${currentRule.maxOrders}`,
              rule2: `${nextRule.minOrders}-${nextRule.maxOrders}`,
            }),
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
            }
          );
          return false;
        }
        if (currentRule.maxOrders + 1 < nextRule.minOrders) {
          toast.error(
            t("gapError", {
              rule1: `${currentRule.maxOrders}`,
              rule2: `${nextRule.minOrders}`,
            }),
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
            }
          );
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    try {
      const rulesWithoutIds = rules.map(({ id, ...rule }) => ({
        minOrders: Number(rule.minOrders),
        maxOrders:
          rule.maxOrders === Infinity || rule.maxOrders === "Infinity"
            ? Infinity
            : Number(rule.maxOrders),
        multiplier: Number(rule.multiplier),
        fixedAmount: Number(rule.fixedAmount),
        applyToMainOrdersOnly: Boolean(rule.applyToMainOrdersOnly),
      }));

      if (!validateRules(rulesWithoutIds)) {
        return;
      }

      setIsSubmitting(true);
      const existingConfig = configs.find(
        (c) => c.vehicleType === selectedVehicle
      );

      if (existingConfig) {
        await dispatch(
          updateSalaryConfig({
            vehicleType: selectedVehicle,
            rules: rulesWithoutIds,
          })
        ).unwrap();
      } else {
        await dispatch(
          createSalaryConfig({
            vehicleType: selectedVehicle,
            rules: rulesWithoutIds,
          })
        ).unwrap();
      }

      // Fetch the updated configs
      await dispatch(fetchSalaryConfigs()).unwrap();

      // No need to manually update rules here as the useEffect will handle it
      // when the configs are updated in the Redux store
    } catch (error) {
      console.error("Error saving configuration:", error);
      dispatchToast(t("saveError"), "error");
    } finally {
      setIsSubmitting(false);
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

  // Add a no rows overlay component
  const CustomNoRowsOverlay = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography level="h6" color="neutral">
        {t("noRulesExist")}
      </Typography>
    </Box>
  );

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
      <Header
        title={t("salaryConfigurationTitle")}
        subtitle={t("salaryConfigurationSubtitle")}
      />

      <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
        <Button
          variant={selectedVehicle === "Car" ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setSelectedVehicle("Car")}
        >
          {t("car")}
        </Button>
        <Button
          variant={selectedVehicle === "Bike" ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setSelectedVehicle("Bike")}
        >
          {t("bike")}
        </Button>
      </Box>

      <Box height="60vh">
        <DataGrid
          rows={rules}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          experimentalFeatures={{ newEditingApi: true }}
          components={{
            NoRowsOverlay: CustomNoRowsOverlay,
          }}
          sx={{
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${colors.grey[100]}`,
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
        />
      </Box>

      <Box display="flex" gap={2} mt={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRule}
        >
          {t("addRule")}
        </Button>
        {rules.length > 0 && (
          <Button variant="contained" color="secondary" onClick={handleSave}>
            {t("saveChanges")}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default SalaryConfig;
