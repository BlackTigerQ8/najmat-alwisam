// redux/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://192.168.0.28:8000/api";

// Initial state
const initialState = {
  userInfo: null,
  users: [],
  status: "",
  token: "",
  userRole: "",
  userProfileImage: "",
};

// Thunk action for user registration
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (userData) => {
    console.log("register user token", localStorage.getItem("token"));
    try {
      // Inside the code where you make API requests
      const response = await axios.post(`${API_URL}/users`, userData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
// export const profileImage = createAsyncThunk(
//   "user/profileImage",
//   async (formData) => {
//     try {
//       const response = await axios.post(`${API_URL}/upload/images`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response.data.message || error.message);
//     }
//   }
// );

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
        toast.success("User is added successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        toast.error("Something went wrong! Please try later.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      });
    ///////////////////
    // .addCase(profileImage.fulfilled, (state, action) => {
    //   state.status = "succeeded";
    //   state.userProfileImage = action.payload.image;
    // });
  },
});

export const { logoutUser, setUser } = userSlice.actions;
export default userSlice.reducer;
