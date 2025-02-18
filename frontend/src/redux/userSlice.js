// redux/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import i18next from "i18next";

const API_URL = process.env.REACT_APP_API_URL;

// console.log("API_URL", API_URL);

// Initial state
const initialState = {
  userInfo: null,
  users: [],
  status: "",
  token: "",
  userRole: "",
  userProfileImage: "",
  deductionInvoice: "",
  invoice: null,
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

// Thunk action for user registration
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (userFormData) => {
    try {
      // Inside the code where you make API requests
      const response = await axios.post(`${API_URL}/users`, userFormData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message || error.message);
    }
  }
);

// Thunk action for user login
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, credentials);
      return response.data;
    } catch (error) {
      if (error.response.status === 401) {
        // Clear local storage if unauthorized
        localStorage.clear();
      }
      throw new Error(error.response.data.message || error.message);
    }
  }
);

// Thunk action for profile image upload
export const profileImage = createAsyncThunk(
  "user/profileImage",
  async (imageFile, { getState }) => {
    const token = localStorage.getItem("token");
    const userId = getState().user.userInfo._id;
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const response = await axios.post(
        `${API_URL}/users/${userId}/profile-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }
);

// Add new thunk action for removing profile image
export const removeProfileImage = createAsyncThunk(
  "user/removeProfileImage",
  async (_, { getState }) => {
    const token = localStorage.getItem("token");
    const userId = getState().user.userInfo._id;

    try {
      const response = await axios.delete(
        `${API_URL}/users/${userId}/profile-image`,
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

// Create user invoice
export const createUserInvoice = createAsyncThunk(
  "user/createUserInvoice",
  async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/users/${values.get("selectedUser")}/invoice`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message || error.message);
    }
  }
);

// User slice with reducers and extra reducers
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.userInfo = action.payload;
      state.userRole = action.payload.user.role;
    },
    logoutUser(state) {
      state.userInfo = null;
      state.userRole = "";
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { user, token } = action.payload.data;
        state.userInfo = user;
        state.token = action.payload.token;
        state.userRole = user.role;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      ///////////////////
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        dispatchToast(i18next.t("registerUserFulfilled"), "success");
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("registerUserRejected"), "error");
      })
      .addCase(profileImage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userProfileImage = action.payload.file;
        dispatchToast(i18next.t("profileImageFulfilled"), "success");
      })
      .addCase(profileImage.rejected, (state) => {
        state.status = "failed";
        dispatchToast(i18next.t("profileImageRejected"), "error");
      })
      .addCase(removeProfileImage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userProfileImage = null;
        dispatchToast(i18next.t("profileImageRemoved"), "success");
      })
      .addCase(removeProfileImage.rejected, (state) => {
        state.status = "failed";
        dispatchToast(i18next.t("profileImageRemovalFailed"), "error");
      })
      .addCase(createUserInvoice.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.invoice = action.payload.data.invoice;
        dispatchToast(i18next.t("createUserInvoiceFulfilled"), "success");
      })
      .addCase(createUserInvoice.rejected, (state) => {
        state.status = "failed";
        dispatchToast(i18next.t("createUserInvoiceRejected"), "error");
      });
  },
});

export const { logoutUser, setUser } = userSlice.actions;
export default userSlice.reducer;
