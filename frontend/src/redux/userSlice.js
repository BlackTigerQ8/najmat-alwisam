// redux/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://192.168.0.28:8000/api";

const initialState = {
  userInfo: null,
  users: [],
  status: "",
  token: "",
};

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, credentials);

      console.log("response.data", response.data);
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

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.userInfo = action.payload;
    },
    logoutUser(state) {
      state.userInfo = null;
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
        console.log("action.payload.token", action.payload.token);
        state.userInfo = user;
        state.token = action.payload.token;
        //localStorage.setItem("userInfo", JSON.stringify(user));
        localStorage.setItem("token", action.payload.token);
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { logoutUser, setUser } = userSlice.actions;

export default userSlice.reducer;
