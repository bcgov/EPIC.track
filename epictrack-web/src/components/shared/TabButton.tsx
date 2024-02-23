import React from "react";
import { Button } from "@mui/material";
import { Palette } from "styles/theme";

type TabButtonProps = {
  children: React.ReactNode;
  tabIndex: number;
  selectedTabIndex: number;
  setSelectedTabIndex: (index: number) => void;
};

const TabButton: React.FC<TabButtonProps> = ({
  children,
  tabIndex,
  selectedTabIndex,
  setSelectedTabIndex,
}) => (
  <Button
    variant="outlined"
    onClick={() => setSelectedTabIndex(tabIndex)}
    sx={{
      backgroundColor:
        selectedTabIndex === tabIndex ? Palette.primary.main : Palette.white,
      color:
        selectedTabIndex === tabIndex ? Palette.white : Palette.primary.main,
    }}
  >
    {children}
  </Button>
);

export default TabButton;
