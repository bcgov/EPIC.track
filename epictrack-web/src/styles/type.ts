export interface UIState {
  isDrawerExpanded: boolean;
  drawerWidth: number;
  showEnvBanner: boolean;
  toggleDrawerMarginTop: string;
  showConfetti: boolean;
}

declare module "@mui/material/styles" {
  interface Palette {
    neutral: Palette["primary"];
  }

  interface PaletteOptions {
    neutral: PaletteOptions["primary"];
  }
}
