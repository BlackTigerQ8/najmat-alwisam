import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  notifications: [],
  status: "",
  error: null,
  count: 0,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await axios.get(`${API_URL}/notifications`, {
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

const getRolesForNotifications = (role) => {
  if (role === "Admin") {
    return [];
  }

  if (role === "Accountant") {
    return [];
  }

  if (role === "Employee") {
    return ["Manager"];
  }

  if (role === "Manager") {
    return ["Admin"];
  }
};

export const buildNotificationAlert = ({
  driverId,
  talabatDeductionAmount,
  companyDeductionAmount,
  userRole,
  notificationRoles = undefined,
}) => {
  return {
    driverId,
    notification_type: "Deduction_Invoice",
    additionalDetails: {
      fieldName: "Deduction invoice",
      talabatDeductionAmount,
      companyDeductionAmount,
    },
    role: notificationRoles || getRolesForNotifications(userRole),
  };
};

// Create notification
export const createNotification = createAsyncThunk(
  "notifications/createNotification",
  async ({ values }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/notifications`, values, {
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

// Mark all notifications read
export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllNotificationsRead",
  async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/notifications/mark-read`,
        {},
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

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers(builder) {
    // Fetch drivers
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notifications = action.payload.data.notifications;
        state.count = action.payload.data.unreadNotificationsCount;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
    builder
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.status = "loading";
      })
      .addCase(markAllNotificationsRead.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.count = 0;
        state.error = null;
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });

    builder
      .addCase(createNotification.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notifications.push(action.payload.data.notification);
        state.error = null;
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default notificationSlice.reducer;
