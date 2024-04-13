import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  bankStatement: [],
  status: "",
  error: null,

  searchStatus: "",
  searchResults: [],
  searchError: null,
};

export const fetchBankStatement = createAsyncThunk(
  "bankStatement/fetchBankStatement",
  async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/bank-statement`, {
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

export const searchBankStatement = createAsyncThunk(
  "bankStatement/searchBankStatement",
  async ({ values }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/bank-statement/search`,
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

export const createBankStatement = createAsyncThunk(
  "bankStatement/createBankStatement",
  async ({ values }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/bank-statement`, values, {
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

const bankStatementSlice = createSlice({
  name: "bankStatement",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBankStatement.pending, (state) => {
        state.status = "loading";
        state.searchStatus = "";
        state.searchResults = [];
      })
      .addCase(fetchBankStatement.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bankStatement = action.payload.data.bankStatement;
      })
      .addCase(fetchBankStatement.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createBankStatement.pending, (state) => {
        state.status = "loading";
        state.searchStatus = "";
      })
      .addCase(createBankStatement.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bankStatement = [
          ...state.bankStatement,
          action.payload.data.bankStatement,
        ];
      })
      .addCase(createBankStatement.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(searchBankStatement.pending, (state) => {
        state.searchStatus = "loading";
      })
      .addCase(searchBankStatement.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.searchResults = action.payload.data.results;
      })
      .addCase(searchBankStatement.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export default bankStatementSlice.reducer;
