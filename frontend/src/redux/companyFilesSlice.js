// redux/companyFileslice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import i18next from "i18next";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  companyFiles: [], // Initialize with stored data if available
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

export const fetchAllCompanyFiles = createAsyncThunk(
  "companyFiles/fetchAllCompanyFiles",
  async (token) => {
    try {
      //const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/company-files`, {
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

export const addCompanyFiles = createAsyncThunk(
  "companyFiles/addCompanyFiles",
  async (values) => {
    try {
      const token = localStorage.getItem("token"); // Assuming 'user' slice has the token
      const response = await axios.post(`${API_URL}/company-files`, values, {
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

export const editCompanyFiles = createAsyncThunk(
  "companyFiles/editCompanyFiles",
  async ({ values, id }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/company-files/${id}`,
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

export const deleteCompanyFile = createAsyncThunk(
  "companyFiles/deleteCompanyFile",
  async (companyFileId, { getState }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_URL}/company-files/${companyFileId}`,
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

const companyFilesSlice = createSlice({
  name: "companyFiles",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAllCompanyFiles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllCompanyFiles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.companyFiles = action.payload.data.companyFiles;
      })
      .addCase(fetchAllCompanyFiles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });

    builder
      .addCase(addCompanyFiles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addCompanyFiles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.companyFiles = [
          ...state.companyFiles,
          action.payload.data.companyFile,
        ];
        dispatchToast(i18next.t("addCompanyFilesFulfilled"), "success");
      })
      .addCase(addCompanyFiles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("addCompanyFilesRejected"), "error");
      });

    //Edit company files
    builder
      .addCase(editCompanyFiles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(editCompanyFiles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.companyFiles = state.companyFiles.map((c) =>
          c._id === action.payload.data.companyFile._id
            ? action.payload.data.companyFile
            : c
        );
        dispatchToast(i18next.t("saveCompanyFilesSuccess"), "success");
      })
      .addCase(editCompanyFiles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("addCompanyFilesRejected"), "success");
      });

    // Delete Company File
    builder
      .addCase(deleteCompanyFile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteCompanyFile.fulfilled, (state, action) => {
        state.status = "succeeded";
        const companyFileId = action.meta.arg;
        state.companyFiles = state.companyFiles.filter(
          (companyFile) => companyFile._id !== companyFileId
        );
        dispatchToast(i18next.t("deleteCompanyFileFulfilled"), "success");
      })
      .addCase(deleteCompanyFile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("deleteCompanyFileRejected"), "error");
      });
  },
});

export default companyFilesSlice.reducer;
