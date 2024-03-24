// redux/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  users: [], // Initialize with stored data if available
  status: "succeeded", // Update status if data is present
  error: null,
  salaries: [],
  salariesStatus: "",
  salariesError: null,
};

export const fetchSalaries = createAsyncThunk(
  "user/fetchSalaries",
  async () => {
    const token = localStorage.getItem("token");
    try {
      // Inside the code where you make API requests
      const response = await axios.get(`${API_URL}/users/salaries`, {
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

export const updateAdditionalSalary = createAsyncThunk(
  "user/updateAdditionalSalary",
  async ({ userId, values }, { getState }) => {
    try {
      const token = getState().user.token;
      const response = await axios.patch(
        `${API_URL}/users/${userId}/salary`,
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
      })
      .addCase(fetchSalaries.fulfilled, (state, action) => {
        state.salariesStatus = "succeeded";
        state.salaries = Object.values(action.payload.data.employeeSalaries);
        state.salariesError = null;
      })
      .addCase(fetchSalaries.rejected, (state, action) => {
        state.salariesStatus = "failed";
      })
      .addCase(updateAdditionalSalary.fulfilled, (state, action) => {
        state.salariesStatus = "succeeded";
        const { _id, remarks, additionalSalary } =
          action.payload.data.updatedUser;
        state.salaries = state.salaries.map((user) =>
          user._id === _id
            ? {
                ...user,
                remarks,
                additionalSalary,
              }
            : user
        );
        state.salariesError = null;
        toast.success("User data is updated successfully.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      })
      .addCase(updateAdditionalSalary.rejected, (state, action) => {
        state.salariesStatus = "failed";
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
