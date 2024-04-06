import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  bankStatement: [],
  status: "",
  error: null,
};

export const fetchBankStatement = createAsyncThunk(
  "bankStatement/fetchBankStatement",
  async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/bank-statement`, values, {
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
      })
      .addCase(createBankStatement.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bankStatement = [
          action.payload.data.bankStatement,
          ...state.bankStatement,
        ];
      })
      .addCase(createBankStatement.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default bankStatementSlice.reducer;
