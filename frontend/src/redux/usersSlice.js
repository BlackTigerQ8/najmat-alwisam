// redux/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { formatDate } from "../utils/dateUtil";
import i18next from "i18next";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  users: [], // Initialize with stored data if available
  status: "succeeded", // Update status if data is present
  error: null,
  salaries: [],
  salariesStatus: "",
  salariesError: null,
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

function buildDateQueryStringParams(params) {
  if (!params) return "";

  return `?startDate=${formatDate(params.startDate)}&endDate=${formatDate(
    params.endDate
  )}`;
}

export const fetchSalaries = createAsyncThunk(
  "user/fetchSalaries",
  async (params) => {
    const token = localStorage.getItem("token");
    try {
      // Inside the code where you make API requests
      const response = await axios.get(
        `${API_URL}/users/salaries${buildDateQueryStringParams(params)}`,
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

export const sendMessage = createAsyncThunk(
  "user/Message",
  async ({ selectedUsers, message }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/users/messages`,
        { selectedUsers, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message || error.message);
    }
  }
);

export const fetchSentMessages = createAsyncThunk(
  "user/fetchMessages",
  async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/users/messages`, {
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
        dispatchToast(i18next.t("deleteUserFulfilled"), "success");
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("deleteUserRejected"), "error");
      });
    // update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedUser = action.payload.data.user;
        state.users = state.users.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        );
        dispatchToast(i18next.t("updateUserFulfilled"), "success");
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("updateUserRejected"), "error");
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
        dispatchToast(i18next.t("updateAdditionalSalaryFulfilled"), "success");
      })
      .addCase(updateAdditionalSalary.rejected, (state, action) => {
        state.salariesStatus = "failed";
        dispatchToast(i18next.t("updateAdditionalSalaryRejected"), "error");
      });
    // Send Message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Update state accordingly, but do not filter users
        state.status = "succeeded";
        dispatchToast(i18next.t("sendMessageFulfilled"), "success");
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        dispatchToast(i18next.t("sendMessageRejected"), "error");
      });
    // Fetch Messages
    builder
      .addCase(fetchSentMessages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSentMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sentMessages = action.payload.data.messages;
      })
      .addCase(fetchSentMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default usersSlice.reducer;
