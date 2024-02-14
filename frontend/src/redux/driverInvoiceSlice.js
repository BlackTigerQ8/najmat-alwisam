import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  driverInvoice: [],
  status: "",
  error: null,
};

export const fetchInvoices = createAsyncThunk(
  "driverInvoice/fetchInvoices",
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

// Create driver invoice
export const createDriverInvoice = createAsyncThunk(
  "driverInvoice/createDriverInvoice",
  async ({ values }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
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
  reducers: {},
  extraReducers(builder) {
    // Fetch drivers
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.driverInvoice = action.payload.data.driverInvoices;
        state.error = null;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
    builder
      .addCase(createDriverInvoice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createDriverInvoice.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.driverInvoice.push(action.payload.data.invoice);
        state.error = null;
        toast.success("Driver invoice is added successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      })
      .addCase(createDriverInvoice.rejected, (state, action) => {
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

export default driverInvoiceSlice.reducer;
