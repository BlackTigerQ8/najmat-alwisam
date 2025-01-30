import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import i18next from "i18next";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  pettyCash: [],
  status: "",
  error: null,
  searchResults: [],
  searchStatus: "",
  searchError: null,
  currentYearPettyCash: [],
  lockedValues: {
    requestApplicant: "",
    serialNumber: "",
  },
  fieldsLocked: false,
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

export const fetchPettyCash = createAsyncThunk(
  "pettyCash/fetchPettyCash",
  async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/petty-cash`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const fetchCurrentYearPettyCash = createAsyncThunk(
  "pettyCash/fetchCurrentYearPettyCash",
  async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/petty-cash/current-year`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const createPettyCash = createAsyncThunk(
  "pettyCash/createPettyCash",
  async ({ values }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/petty-cash`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const searchPettyCash = createAsyncThunk(
  "pettyCash/searchPettyCash",
  async ({ values }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/petty-cash/search`,
        {
          startDate: values.startDate,
          endDate: values.endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

// Combined Petty Cash and Bank Statement Search
export const searchCombinedSpends = createAsyncThunk(
  "pettyCash/searchCombinedSpends",
  async ({ values }) => {
    try {
      const token = localStorage.getItem("token");

      // Ensure we have the required date values
      if (!values.startDate || !values.endDate) {
        throw new Error("Start date and end date are required");
      }

      // Create start and end dates with proper time ranges
      const startDate = new Date(values.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(values.endDate);
      endDate.setHours(23, 59, 59, 999);

      const [pettyCashResponse, bankStatementResponse] = await Promise.all([
        axios.post(
          `${API_URL}/petty-cash/search`,
          {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.post(
          `${API_URL}/bank-statement/search`,
          {
            bankAccountNumber: values.bankAccountNumber || "7568",
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      return {
        pettyCash: pettyCashResponse.data.data.results,
        bankStatement: bankStatementResponse.data.data.results,
      };
    } catch (error) {
      throw error;
    }
  }
);

export const updatePettyCash = createAsyncThunk(
  "pettyCash/updatePettyCash",
  async ({ id, updates }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/petty-cash/${id}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const deletePettyCash = createAsyncThunk(
  "pettyCash/deletePettyCash",
  async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/petty-cash/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id;
    } catch (error) {
      throw error;
    }
  }
);

const pettyCashSlice = createSlice({
  name: "pettyCash",
  initialState,
  reducers: {
    setLockedValues: (state, action) => {
      state.lockedValues = {
        requestApplicant: action.payload.requestApplicant,
        serialNumber: action.payload.serialNumber,
      };
      state.fieldsLocked = true;
    },
    clearLockedValue: (state, action) => {
      const fieldName = action.payload;
      delete state.lockedValues[fieldName];
      if (Object.keys(state.lockedValues).length === 0) {
        state.fieldsLocked = false;
        state.lockedValues = {
          requestApplicant: "",
          serialNumber: "",
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPettyCash.pending, (state) => {
        state.status = "loading";
        state.searchStatus = "";
        state.searchResults = [];
      })
      .addCase(fetchPettyCash.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pettyCash = action.payload.data.pettyCash;
      })
      .addCase(fetchPettyCash.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchCurrentYearPettyCash.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentYearPettyCash.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentYearPettyCash = action.payload.data.pettyCash;
      })
      .addCase(fetchCurrentYearPettyCash.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(searchPettyCash.pending, (state) => {
        state.searchStatus = "loading";
      })
      .addCase(searchPettyCash.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.searchResults = action.payload.data.results;
      })
      .addCase(searchPettyCash.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(searchCombinedSpends.pending, (state) => {
        state.searchStatus = "loading";
      })
      .addCase(searchCombinedSpends.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.searchResults = action.payload.pettyCash;
        state.combinedSearchResults = {
          pettyCash: action.payload.pettyCash,
          bankStatement: action.payload.bankStatement,
        };
      })
      .addCase(searchCombinedSpends.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(createPettyCash.pending, (state) => {
        state.status = "loading";
        state.searchStatus = "";
      })
      .addCase(createPettyCash.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pettyCash = [...state.pettyCash, action.payload.data.pettyCash];
        dispatchToast(i18next.t("createPettyCashFulfilled"), "success");
      })
      .addCase(createPettyCash.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("createPettyCashRejected"), "error");
      })
      .addCase(updatePettyCash.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updatePettyCash.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.pettyCash.findIndex(
          (item) => item._id === action.payload.data.pettyCash._id
        );
        if (index !== -1) {
          state.pettyCash[index] = action.payload.data.pettyCash;
        }
        dispatchToast(i18next.t("updatePettyCashFulfilled"), "success");
      })
      .addCase(updatePettyCash.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("updatePettyCashRejected"), "error");
      })
      .addCase(deletePettyCash.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pettyCash = state.pettyCash.filter(
          (item) => item._id !== action.payload
        );
        dispatchToast(i18next.t("deletePettyCashFulfilled"), "success");
      })
      .addCase(deletePettyCash.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("deletePettyCashRejected"), "error");
      });
  },
});

export default pettyCashSlice.reducer;
export const { setLockedValues, clearLockedValue } = pettyCashSlice.actions;
