import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://192.168.0.28:8000/api";

const initialState = {
  driverInvoice: [],
  status: "",
  error: null,
};

export const fetchInvoices = createAsyncThunk(
  "driver/fetchInvoices",
  async (token) => {
    try {
      const response = await axios.get(`${API_URL}/driver-invoice/invoice`, {
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
export const updateDriverInvoice = createAsyncThunk(
  "driver/updateDriverInvoice",
  async ({ values }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/driver-invoice/invoice`,
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

const driverInvoiceSlice = createSlice({
  name: "driverInvoice",
  initialState,
  reducers: {
    setDriver: (state, action) => {
      state.driverInfo = action.payload;
    },
  },
  extraReducers(builder) {
    // Fetch drivers
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.driverInvoice = action.payload.data.driverInvoice;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
    builder
      .addCase(driverInvoiceSlice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(driverInvoiceSlice.fulfilled, (state, action) => {
        state.status = "succeeded";
        toast.success("New driver invoice is added successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      })
      .addCase(driverInvoiceSlice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        toast.error("Can't add a driver invoice, you can try later!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      });
  },
});

export const { setDriverInvoice } = driverInvoiceSlice.actions;
export default driverInvoiceSlice.reducer;
