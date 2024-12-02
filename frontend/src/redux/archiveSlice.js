import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
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
        state.archives.push(action.payload);
        state.message = "Archive added successfully!";
      })
      .addCase(addArchive.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
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
        state.error = action.payload;
      });
  },
});

export const { resetMessage } = archiveSlice.actions;
export default archiveSlice.reducer;
