import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import userReducer from "./userSlice";
import usersReducer from "./usersSlice";
import driversReducer from "./driversSlice";
import driverInvoiceReducer from "./invoiceSlice";
import notificationReducer from "./notificationSlice";
import pettyCashReducer from "./pettyCashSlice";
import companyIncomeReducer from "./companyIncomeSlice";
import bankStatementReducer from "./bankStatementSlice";
import spendTypeReducer from "./spendTypeSlice";
import companyFilesReducer from "./companyFilesSlice";
import archiveReducer from "./archiveSlice";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  user: userReducer,
  users: usersReducer,
  drivers: driversReducer,
  invoice: driverInvoiceReducer,
  notifications: notificationReducer,
  pettyCash: pettyCashReducer,
  bankStatement: bankStatementReducer,
  spendType: spendTypeReducer,
  companyIncome: companyIncomeReducer,
  companyFiles: companyFilesReducer,
  archive: archiveReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
