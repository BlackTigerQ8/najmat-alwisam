import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import i18next from "i18next";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  driverInvoices: [],
  status: "",
  error: null,
  employeeInvoices: [],
  employeeInvoicesStatus: "",
  employeeInvoicesError: null,

  archivedDriverInvoices: [],
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

export const fetchArchivedInvoices = createAsyncThunk(
  "invoice/fetchArchivedInvoices",
  async (token) => {
    try {
      const response = await axios.get(`${API_URL}/driver-invoice/archived`, {
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

export const searchArchivedInvoices = createAsyncThunk(
  "invoice/searchArchivedInvoices",
  async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/driver-invoice/archived/search`,
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
  async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/driver-invoice/invoice`,
        values,
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

export const updateDriverInvoice = createAsyncThunk(
  "invoice/updateDriverInvoice",
  async ({ values }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/driver-invoice/invoice/${values.id}`,
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

export const resetDriverInvoices = createAsyncThunk(
  "invoice/resetDriverInvoices",
  async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/driver-invoice/reset`,
        {},
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

export const resetSingleDriverInvoice = createAsyncThunk(
  "invoice/resetSingleDriverInvoice",
  async ({ params }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/driver-invoice/reset/drivers/${params.driverId}`,
        {},
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

export const updateEmployeeInvoice = createAsyncThunk(
  "invoice/driverInvoiceStatus",
  async ({ values }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/users/invoice/${values.id}`,
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
      .addCase(fetchArchivedInvoices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchArchivedInvoices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.archivedDriverInvoices = action.payload.data.driverInvoices;
        state.error = null;
      })
      .addCase(fetchArchivedInvoices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(searchArchivedInvoices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchArchivedInvoices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.archivedDriverInvoices = action.payload.data.driverInvoices;
        state.error = null;
      })
      .addCase(searchArchivedInvoices.rejected, (state, action) => {
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
        const userRole = JSON.parse(
          JSON.parse(localStorage.getItem("persist:root")).user
        ).userInfo.role;
        if (userRole !== "Admin")
          state.driverInvoices.push(action.payload.data.invoice);
        state.error = null;
        dispatchToast(i18next.t("createDriverInvoiceFulfilled"), "success");
      })
      .addCase(createDriverInvoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("createDriverInvoiceRejected"), "error");
      });

    builder
      .addCase(updateDriverInvoice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateDriverInvoice.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedInvoice = action.payload.data.invoice;
        state.driverInvoices = state.driverInvoices.filter(
          (d) => d._id !== updatedInvoice._id
        );
        state.error = null;
        dispatchToast(i18next.t("updateDriverInvoiceFulfilled"), "success");
      })
      .addCase(updateDriverInvoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("updateDriverInvoiceRejected"), "error");
      })
      .addCase(updateEmployeeInvoice.pending, (state) => {
        state.employeeInvoicesStatus = "loading";
      })
      .addCase(updateEmployeeInvoice.fulfilled, (state, action) => {
        state.employeeInvoicesStatus = "succeeded";
        const updatedInvoice = action.payload.data.invoice;
        state.employeeInvoices = state.employeeInvoices.filter(
          (d) => d._id !== updatedInvoice._id
        );
        state.employeeInvoicesError = null;
        dispatchToast(i18next.t("updateEmployeeInvoiceFulfilled"), "success");
      })
      .addCase(updateEmployeeInvoice.rejected, (state, action) => {
        state.employeeInvoicesStatus = "failed";
        state.employeeInvoicesError = action.error.message;
        dispatchToast(i18next.t("updateEmployeeInvoiceRejected"), "error");
      })
      .addCase(resetDriverInvoices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(resetDriverInvoices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.driverInvoices = [];
        state.error = null;
        dispatchToast(i18next.t("resetDriverInvoicesFulfilled"), "success");
      })
      .addCase(resetDriverInvoices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("resetDriverInvoicesRejected"), "error");
      })
      .addCase(resetSingleDriverInvoice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(resetSingleDriverInvoice.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.driverInvoices = state.driverInvoices.filter(
          (d) => d.driver._id !== action.payload.data.driverId
        );
        state.error = null;
        dispatchToast(
          i18next.t("resetSingleDriverInvoiceFulfilled"),
          "success"
        );
      })
      .addCase(resetSingleDriverInvoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("resetSingleDriverInvoiceRejected"), "error");
      });
  },
});

export default driverInvoiceSlice.reducer;
