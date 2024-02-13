// redux/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  users: [], // Initialize with stored data if available
  status: "succeeded", // Update status if data is present
  error: null,
};

export const fetchUsers = createAsyncThunk("user/fetchUsers", async (token) => {
  try {
    //const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || error.message);
  }
});

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId, { getState }) => {
    try {
      const token = localStorage.getItem("token"); // Assuming 'user' slice has the token
      const response = await axios.delete(`${API_URL}/users/${userId}`, {
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

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userId, formData }, { getState }) => {
    try {
      const token = getState().user.token;
      const response = await axios.patch(
        `${API_URL}/users/${userId}`,
        formData,
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

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload.data.users;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
    // delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const deletedUserId = action.meta.arg;
        state.users = state.users.filter((user) => user._id !== deletedUserId);
        toast.success("User is successfully deleted!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        toast.error("Can't delete a user, you can try later!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      });
    // update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
        console.log("updateUser.pending");
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        console.log("updateUser.fulfilled");
        state.status = "succeeded";
        const updatedUser = action.payload.data.user;
        state.users = state.users.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        );
        toast.success("User Information is updated successfully.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      })
      .addCase(updateUser.rejected, (state, action) => {
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
  },
});

export default usersSlice.reducer;
