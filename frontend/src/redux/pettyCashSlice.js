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
        values,
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

const pettyCashSlice = createSlice({
  name: "pettyCash",
  initialState,
  reducers: {},
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
      });
  },
});

export default pettyCashSlice.reducer;
