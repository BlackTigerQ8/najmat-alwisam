import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import i18next from "i18next";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  bankStatement: [],
  status: "",
  error: null,

  searchStatus: "",
  searchResults: [],
  searchError: null,

  currentYearBankStatement: [],
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

export const fetchBankAccounts = createAsyncThunk(
  "bankStatement/fetchBankAccounts",
  async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/bank-statement/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      throw error;
    }
  }
);

export const fetchCurrentYearBankStatement = createAsyncThunk(
  "bankStatement/fetchCurrentYearBankStatement",
  async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/bank-statement/current-year`,
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

export const updateBankStatement = createAsyncThunk(
  "bankStatement/updateBankStatement",
  async ({ id, updates }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/bank-statement/${id}`,
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

export const deleteBankStatement = createAsyncThunk(
  "bankStatement/deleteBankStatement",
  async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/bank-statement/${id}`, {
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

export const createNewBankAccount = createAsyncThunk(
  "bankStatement/createNewBankAccount",
  async ({ accountNumber, accountName }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/bank-statement/create-account`,
        { accountNumber, accountName },
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
      .addCase(fetchCurrentYearBankStatement.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentYearBankStatement.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentYearBankStatement = action.payload.data.bankStatement;
      })
      .addCase(fetchCurrentYearBankStatement.rejected, (state, action) => {
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
        dispatchToast(i18next.t("createBankStatementFulfilled"), "success");
      })
      .addCase(createBankStatement.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("createBankStatementRejected"), "error");
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
      })
      .addCase(updateBankStatement.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateBankStatement.fulfilled, (state, action) => {
        const updatedStatement = action.payload.data.bankStatement;
        state.bankStatement = state.bankStatement.map((statement) =>
          statement._id === updatedStatement._id ? updatedStatement : statement
        );
        dispatchToast(i18next.t("updateBankStatementFulfilled"), "success");
      })
      .addCase(updateBankStatement.rejected, (state, action) => {
        dispatchToast(i18next.t("updateBankStatementRejected"), "error");
      })
      .addCase(deleteBankStatement.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteBankStatement.fulfilled, (state, action) => {
        const deletedId = action.payload.data.id;
        state.bankStatement = state.bankStatement.filter(
          (statement) => statement._id !== deletedId
        );
        dispatchToast(i18next.t("deleteBankStatementFulfilled"), "success");
      })
      .addCase(deleteBankStatement.rejected, (state, action) => {
        dispatchToast(i18next.t("deleteBankStatementRejected"), "error");
      })
      .addCase(createNewBankAccount.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createNewBankAccount.fulfilled, (state, action) => {
        state.status = "succeeded";
        dispatchToast(i18next.t("accountCreatedSuccessfully"), "success");
      })
      .addCase(createNewBankAccount.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("errorCreatingAccount"), "error");
      })
      .addCase(fetchBankAccounts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBankAccounts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bankAccounts = action.payload.data.bankAccounts;
      })
      .addCase(fetchBankAccounts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("fetchBankAccountsRejected"), "error");
      });
  },
});

export default bankStatementSlice.reducer;
