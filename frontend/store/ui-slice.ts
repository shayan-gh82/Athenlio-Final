import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  dashboardSidebarOpen: boolean;
}

const initialState: UiState = {
  dashboardSidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setDashboardSidebarOpen(state, action: PayloadAction<boolean>) {
      state.dashboardSidebarOpen = action.payload;
    },
  },
});

export const { setDashboardSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
