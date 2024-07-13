import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import i18next from "i18next";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  companyIncome: [],
  status: "",
  error: null,
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

export const fetchCompanyIncome = createAsyncThunk(
  "companyIncome/fetchCompanyIncome",
  async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/company-income`, {
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

export const createCompanyIncome = createAsyncThunk(
  "companyIncome/createCompanyIncome",
  async ({ values }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/company-income`, values, {
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

const companyIncomeSlice = createSlice({
  name: "pettyCash",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyIncome.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCompanyIncome.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.companyIncome = action.payload.data.companyIncome;
      })
      .addCase(fetchCompanyIncome.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createCompanyIncome.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createCompanyIncome.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.companyIncome = [
          ...state.companyIncome,
          action.payload.data.companyIncome,
        ];
        dispatchToast(i18next.t("createCompanyIncomeFulfilled"), "success");
      })
      .addCase(createCompanyIncome.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("createCompanyIncomeRejected"), "error");
      });
  },
});

export default companyIncomeSlice.reducer;
