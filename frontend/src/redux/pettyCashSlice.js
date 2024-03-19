import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  pettyCash: [],
  status: "",
  error: null,
};

export const fetchPettyCash = createAsyncThunk(
  "pettyCash/fetchPettyCash",
  async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/petty-cash`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
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
      })
      .addCase(fetchPettyCash.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pettyCash = action.payload;
      })
      .addCase(fetchPettyCash.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default pettyCashSlice.reducer;
