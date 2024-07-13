import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { formatDate } from "../utils/dateUtil";
import i18next from "i18next";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  driverInfo: null,
  drivers: [],
  status: "",
  error: null,
  salaries: [],
  salariesStatus: "",
  salariesError: null,
  summary: {
    totalOrders: 0,
    totalCash: 0,
    totalHours: 0,
  },
  summaryStatus: "",
  summaryError: null,
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

// Create a new driver
export const registerDriver = createAsyncThunk(
  "driver/registerDriver",
  async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/drivers`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message || error.message);
    }
  }
);

export const fetchDrivers = createAsyncThunk(
  "driver/fetchDrivers",
  async (token) => {
    try {
      const response = await axios.get(`${API_URL}/drivers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message || error.message);
    }
  }
);

// Fetch driver summary
export const fetchDriverSummary = createAsyncThunk(
  "driver/fetchDriverSummary",
  async (token) => {
    try {
      const response = await axios.get(`${API_URL}/drivers/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response.data.message || error.message);
    }
  }
);

// Delete driver
export const deleteDriver = createAsyncThunk(
  "driver/deleteDriver",
  async (driverId, { getState }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/drivers/${driverId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message || error.message);
    }
  }
);

// Update driver
export const updateDriver = createAsyncThunk(
  "driver/updateDriver",
  async ({ formData, driverId }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/drivers/${driverId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message || error.message);
    }
  }
);

// Deactivate driver
export const deactivateDriver = createAsyncThunk(
  "driver/deactivateDriver",
  async ({ formData, driverId }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/drivers/${driverId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message || error.message);
    }
  }
);

export const overrideDriverSalary = createAsyncThunk(
  "driver/overrideDriverSalary",
  async ({ values }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/driver-invoice/override`,
        values,
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

function buildDateQueryStringParams(params) {
  if (!params) return "";

  return `?startDate=${formatDate(params.startDate)}&endDate=${formatDate(
    params.endDate
  )}`;
}

export const fetchSalaries = createAsyncThunk(
  "driver/fetchSalaries",
  async (params) => {
    const token = localStorage.getItem("token");
    try {
      // Inside the code where you make API requests
      const response = await axios.get(
        `${API_URL}/drivers/salaries${buildDateQueryStringParams(params)}`,
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

const driversSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    setDriver: (state, action) => {
      state.driverInfo = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(registerDriver.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerDriver.fulfilled, (state, action) => {
        state.status = "succeeded";
        dispatchToast(i18next.t("registerDriverFulfilled"), "success");
      })
      .addCase(registerDriver.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("registerDriverRejected"), "error");
      });
    // Fetch drivers
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.drivers = action.payload.data.drivers;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
    // Fetch drivers summary
    builder
      .addCase(fetchDriverSummary.pending, (state) => {
        state.summaryStatus = "loading";
      })
      .addCase(fetchDriverSummary.fulfilled, (state, action) => {
        state.summaryStatus = "succeeded";
        state.summary = action.payload;
      })
      .addCase(fetchDriverSummary.rejected, (state, action) => {
        state.summaryStatus = "failed";
        state.summaryError = action.error.message;
      });

    // delete driver
    builder
      .addCase(deleteDriver.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.status = "succeeded";
        const deletedDriverId = action.meta.arg;
        state.drivers = state.drivers.filter(
          (driver) => driver._id !== deletedDriverId
        );
        dispatchToast(i18next.t("deleteDriverFulfilled"), "success");
      })
      .addCase(deleteDriver.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("deleteDriverRejected"), "error");
      });
    // update driver
    builder
      .addCase(fetchSalaries.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSalaries.fulfilled, (state, action) => {
        state.salariesStatus = "succeeded";
        state.salaries = Object.values(action.payload.data.driverSalaries);
        state.salariesError = null;
      })
      .addCase(fetchSalaries.rejected, (state, action) => {
        state.salariesStatus = "failed";
        state.salariesError = action.error.message;
      })
      .addCase(updateDriver.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateDriver.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedDriver = action.payload.data.driver;
        state.drivers = state.drivers.map((driver) =>
          driver._id === updatedDriver._id ? updatedDriver : driver
        );
        dispatchToast(i18next.t("updatedDriverFulfilled"), "success");
      })
      .addCase(updateDriver.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("updatedDriverRejected"), "error");
      })
      .addCase(deactivateDriver.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deactivateDriver.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedDriver = action.payload.data.driver;
        state.drivers = state.drivers.map((driver) =>
          driver._id === updatedDriver._id ? updatedDriver : driver
        );
        dispatchToast(i18next.t("deactivatedDriverFulfilled"), "success");
      })
      .addCase(deactivateDriver.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("deactivatedDriverrejected"), "error");
      })
      .addCase(overrideDriverSalary.pending, (state) => {
        state.salariesStatus = "loading";
      })
      .addCase(overrideDriverSalary.fulfilled, (state, action) => {
        state.salariesStatus = "succeeded";
        const updatedInvoice = action.payload.data.invoice;

        state.salaries = state.salaries.map((driver) =>
          driver._id === updatedInvoice.driver
            ? { ...driver, ...updatedInvoice, _id: updatedInvoice.driver }
            : driver
        );
        dispatchToast(i18next.t("overrideDriverSalaryFulfilled"), "success");
      })
      .addCase(overrideDriverSalary.rejected, (state, action) => {
        state.salariesStatus = "failed";
        state.salariesError = action.error.message;
        dispatchToast(i18next.t("overrideDriverSalaryRejected"), "error");
      });
  },
});

export const { setDriver } = driversSlice.actions;
export default driversSlice.reducer;
