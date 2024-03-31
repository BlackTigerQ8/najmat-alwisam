import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  pettyCash: [],
  status: "",
  error: null,
  searchResults: [],
  searchStatus: "",
  searchError: null,
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

        toast.success("Spend type is successfully added!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      })
      .addCase(createPettyCash.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;

        toast.error("Can't add a petty cash, you can try later!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      });
  },
});

export default pettyCashSlice.reducer;
