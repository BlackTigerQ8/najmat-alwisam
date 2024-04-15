import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  driverInvoices: [],
  status: "",
  error: null,
  employeeInvoices: [],
  employeeInvoicesStatus: "",
  employeeInvoicesError: null,
};

export const fetchInvoices = createAsyncThunk(
  "invoice/fetchInvoices",
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

export const fetchEmployeeInvoices = createAsyncThunk(
  "invoice/fetchEmployeeInvoices",
  async (token) => {
    try {
      const response = await axios.get(`${API_URL}/users/invoices`, {
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
  "invoice/createDriverInvoice",
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
  name: "invoice",
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
        state.driverInvoices = action.payload.data.driverInvoices;
        state.error = null;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchEmployeeInvoices.pending, (state) => {
        state.employeeInvoicesStatus = "loading";
      })
      .addCase(fetchEmployeeInvoices.fulfilled, (state, action) => {
        state.employeeInvoicesStatus = "succeeded";
        state.employeeInvoices = action.payload.data.employeeInvoices;
        state.employeeInvoicesError = null;
      })
      .addCase(fetchEmployeeInvoices.rejected, (state, action) => {
        state.employeeInvoicesStatus = "failed";
        state.employeeInvoicesError = action.error.message;
      });
    builder
      .addCase(createDriverInvoice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createDriverInvoice.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.driverInvoices.push(action.payload.data.invoice);
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
