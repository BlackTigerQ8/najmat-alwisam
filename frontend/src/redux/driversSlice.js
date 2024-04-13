import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  driverInfo: null,
  drivers: [],
  status: "",
  error: null,
  salaries: [],
  salariesStatus: "",
  salariesError: null,
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

export const fetchSalaries = createAsyncThunk(
  "driver/fetchSalaries",
  async () => {
    const token = localStorage.getItem("token");
    try {
      // Inside the code where you make API requests
      const response = await axios.get(`${API_URL}/drivers/salaries`, {
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
        toast.success("New driver is added successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      })
      .addCase(registerDriver.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        toast.error("Can't add a driver, you can try later!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      });
    // Fetch drivers
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.salariesStatus = "loading";
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.salariesStatus = "succeeded";
        state.drivers = action.payload.data.drivers;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.salariesStatus = "failed";
        state.error = action.error.message;
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
        toast.success("Driver is successfully deleted!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      })
      .addCase(deleteDriver.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        toast.error("Can't delete a driver, you can try later!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
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
        dispatchToast(
          "Driver's information is successfully updated!",
          "success"
        );
      })
      .addCase(updateDriver.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        toast.error("Can't update a driver's information, you can try later!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
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
        dispatchToast(
          "Driver's information is successfully updated!",
          "success"
        );
      })
      .addCase(overrideDriverSalary.rejected, (state, action) => {
        state.salariesStatus = "failed";
        state.salariesError = action.error.message;
        toast.error("Can't update a driver's information, you can try later!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      });
  },
});

export const { setDriver } = driversSlice.actions;
export default driversSlice.reducer;
