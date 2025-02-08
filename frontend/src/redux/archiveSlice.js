import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import i18next from "i18next";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  archives: [],
  status: "idle",
  error: null,
  message: "",
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

// Async thunk to add an archive
export const addArchive = createAsyncThunk(
  "archive/addArchive",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/archives`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to fetch all archives
export const fetchArchives = createAsyncThunk(
  "archive/fetchArchives",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/archives`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data?.data?.archives || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to update an archive
export const updateArchive = createAsyncThunk(
  "archive/updateArchive",
  async ({ archiveId, modifications }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/archives/${archiveId}`,
        modifications,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data?.data?.archive;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to delete an archive
export const deleteArchive = createAsyncThunk(
  "archive/deleteArchive",
  async (archiveId, { getState }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/archives/${archiveId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return archiveId;
    } catch (error) {
      throw new Error(error.response.data.message || error.message);
    }
  }
);

const archiveSlice = createSlice({
  name: "archive",
  initialState,
  reducers: {
    resetMessage(state) {
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addArchive.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addArchive.fulfilled, (state, action) => {
        state.status = "succeeded";
        dispatchToast(i18next.t("addArchiveFulfilled"), "success");
      })
      .addCase(addArchive.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("addArchiveRejected"), "error");
      })
      .addCase(fetchArchives.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchArchives.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.archives = action.payload;
      })
      .addCase(fetchArchives.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateArchive.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateArchive.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedArchive = action.payload;
        state.archives = state.archives.map((archive) =>
          archive._id === updatedArchive._id ? updatedArchive : archive
        );
        dispatchToast(i18next.t("updateArchiveFulfilled"), "success");
      })
      .addCase(updateArchive.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("updateArchiveRejected"), "error");
      })
      .addCase(deleteArchive.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteArchive.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.archives = state.archives.filter(
          (archive) => archive._id !== action.payload
        );
        dispatchToast(i18next.t("deleteArchiveFulfilled"), "success");
      })
      .addCase(deleteArchive.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("deleteArchiveRejected"), "error");
      });
  },
});

export const { resetMessage } = archiveSlice.actions;
export default archiveSlice.reducer;
