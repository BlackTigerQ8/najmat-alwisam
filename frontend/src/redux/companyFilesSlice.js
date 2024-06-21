// redux/companyFileslice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  companyFiles: [], // Initialize with stored data if available
  status: "",
  error: null,
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
        toast.success("Company file is successfully added!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      })
      .addCase(addCompanyFiles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        toast.error("Can't add a company file, you can try later!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
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
        toast.success("Company file is successfully deleted!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      })
      .addCase(deleteCompanyFile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        toast.error("Can't delete company file, please try again later!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      });
  },
});

export default companyFilesSlice.reducer;
