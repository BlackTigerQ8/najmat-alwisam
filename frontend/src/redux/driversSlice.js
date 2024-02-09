import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  driverInfo: null,
  drivers: [],
  status: "",
  error: null,
};

// Create a new driver
export const registerDriver = createAsyncThunk(
  "driver/registerDriver",
  async (values, { getState }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/drivers`, values, {
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
  async ({ values, driverId }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/drivers/${driverId}`,
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
      .addCase(updateDriver.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateDriver.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedDriver = action.payload.data.driver;

        state.drivers = state.drivers.map((driver) =>
          driver._id === updatedDriver._id ? updatedDriver : driver
        );
        toast.success("Driver's information is successfully updated!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
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
      });
  },
});

export const { setDriver } = driversSlice.actions;
export default driversSlice.reducer;
