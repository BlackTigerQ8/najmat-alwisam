// redux/spendTypeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  spendTypes: [], // Initialize with stored data if available
  status: "succeeded", // Update status if data is present
  error: null,
};

export const fetchAllSpendTypes = createAsyncThunk(
  "spendType/fetchAllSpendTypes",
  async (token) => {
    try {
      //const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/spend-types`, {
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

export const addSpendType = createAsyncThunk(
  "spendType/addSpendType",
  async () => {
    try {
      const token = localStorage.getItem("token"); // Assuming 'user' slice has the token
      const response = await axios.post(`${API_URL}/spend-types`, {
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

const spendTypeSlice = createSlice({
  name: "spendType",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAllSpendTypes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllSpendTypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.spendTypes = action.payload.data.spendTypes;
      })
      .addCase(fetchAllSpendTypes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
    // delete user
    builder
      .addCase(addSpendType.fulfilled, (state, action) => {
        state.spendTypes = [...state.spendTypes, action.payload.data.spendType];
        toast.success("Spend type is successfully added!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      })
      .addCase(addSpendType.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        toast.error("Can't add a spend type, you can try later!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      });
  },
});

export default spendTypeSlice.reducer;
