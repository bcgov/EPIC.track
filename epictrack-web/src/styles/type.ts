export interface UIState {
  isDrawerExpanded: boolean;
  drawerWidth: number;
  showEnvBanner: boolean;
  toggleDrawerMarginTop: string;
}

declare module "@mui/material/styles" {
  interface Palette {
    neutral: Palette["primary"];
  }

  interface PaletteOptions {
    neutral: PaletteOptions["primary"];
  }
}
