import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import i18next from "i18next";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  configs: [],
  status: "idle",
  error: null,
};

const dispatchToast = (message, type) => {
  toast[type](message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const fetchSalaryConfigs = createAsyncThunk(
  "salaryConfig/fetchAll",
  async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_URL}/salary-config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }
);

export const createSalaryConfig = createAsyncThunk(
  "salaryConfig/create",
  async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/salary-config`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message || error.message);
    }
  }
);

export const updateSalaryConfig = createAsyncThunk(
  "salaryConfig/update",
  async ({ vehicleType, rules }) => {
    // Note: we receive vehicleType here
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `${API_URL}/salary-config/${vehicleType}`,
        { rules },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { ...response.data.data, vehicleType }; // Include vehicleType in the return
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }
);

export const deleteSalaryConfig = createAsyncThunk(
  "salaryConfig/delete",
  async (vehicleType, { getState }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_URL}/salary-config/${vehicleType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message || error.message);
    }
  }
);

const salaryConfigSlice = createSlice({
  name: "salaryConfig",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(createSalaryConfig.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createSalaryConfig.fulfilled, (state, action) => {
        state.status = "succeeded";
        dispatchToast(i18next.t("createSalaryConfigFulfilled"), "success");
      })
      .addCase(createSalaryConfig.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("createSalaryConfigRejected"), "error");
      })
      .addCase(fetchSalaryConfigs.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSalaryConfigs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.configs = action.payload;
      })
      .addCase(fetchSalaryConfigs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Update cases
      .addCase(updateSalaryConfig.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateSalaryConfig.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Find and update the config in the state
        const index = state.configs.findIndex(
          (config) => config.vehicleType === action.payload.vehicleType
        );
        if (index !== -1) {
          state.configs[index] = action.payload;
        } else {
          state.configs.push(action.payload);
        }
        dispatchToast(i18next.t("updateSalaryConfigFulfilled"), "success");
      })
      .addCase(updateSalaryConfig.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("updateSalaryConfigRejected"), "error");
      })
      // Delete cases
      .addCase(deleteSalaryConfig.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteSalaryConfig.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.configs = state.configs.filter(
          (config) => config.vehicleType !== action.payload.vehicleType
        );
        dispatchToast(i18next.t("deleteSalaryConfigFulfilled"), "success");
      })
      .addCase(deleteSalaryConfig.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("deleteSalaryConfigRejected"), "error");
      });
  },
});

export default salaryConfigSlice.reducer;
