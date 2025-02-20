import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
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
import i18nReducer from "./i18nSlice";
import salaryConfigReducer from "./salaryConfigSlice";

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
  salaryConfig: salaryConfigReducer,
  i18n: i18nReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ["i18n"],
      },
    }),
});

export const persistor = persistStore(store);
