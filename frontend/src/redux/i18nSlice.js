import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  language: localStorage.getItem("i18nextLng") || "en",
};

const i18nSlice = createSlice({
  name: "i18n",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem("i18nextLng", action.payload);
    },
  },
});

export const { setLanguage } = i18nSlice.actions;
export default i18nSlice.reducer;
