import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UIState } from "./type";

const initialState: UIState = {
  isDrawerExpanded: true,
  drawerWidth: 260,
  showEnvBanner: false,
  toggleDrawerMarginTop: "5rem",
  showConfetti: false,
};

export const uiStateSlice = createSlice({
  name: "uiState",
  initialState,
  reducers: {
    toggleDrawer: (state) => {
      const isDrawerExpanded = !state.isDrawerExpanded;
      state.isDrawerExpanded = isDrawerExpanded;
      state.drawerWidth = isDrawerExpanded ? 260 : 0;
    },
    envBanner: (state, action: PayloadAction<boolean>) => {
      state.showEnvBanner = action.payload;
      state.toggleDrawerMarginTop = state.showEnvBanner ? "3rem" : "1rem";
    },
    showConfetti: (state, action: PayloadAction<boolean>) => {
      state.showConfetti = action.payload;
    },
  },
});

export const { toggleDrawer, envBanner, showConfetti } = uiStateSlice.actions;

export default uiStateSlice.reducer;
