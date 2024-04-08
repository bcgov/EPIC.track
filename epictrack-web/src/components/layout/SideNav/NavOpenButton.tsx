import React from "react";
import { Box, BoxProps, styled, useTheme } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAppDispatch, useAppSelector } from "hooks";
import { Palette } from "styles/theme";
import { toggleDrawer } from "styles/uiStateSlice";

const PlainDrawerToggleButton = ({
  children,
  ...rest
}: BoxProps & { open: boolean }) => {
  return <Box {...rest}>{children}</Box>;
};

const DrawerToggleButton = styled(PlainDrawerToggleButton, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer,
  top: 85,
  height: 48,
  width: 32,
  backgroundColor: Palette.primary.main,
  color: Palette.white,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "fixed",
  borderRadius: "0 8px 8px 0",
  overflow: "hidden",
}));

const NavOpenButton = () => {
  const { isDrawerExpanded } = useAppSelector((state) => state.uiState);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const handleToggleDrawer = () => {
    dispatch(toggleDrawer());
  };
  return (
    <Box
      sx={{
        height: "100%",
        width: 32,
        zIndex: theme.zIndex.drawer,
      }}
    >
      <DrawerToggleButton
        id="nav-button"
        open={isDrawerExpanded}
        sx={{
          cursor: "pointer",
        }}
        onClick={handleToggleDrawer}
      >
        <ChevronRightIcon
          fontSize="large"
          sx={{
            transform: isDrawerExpanded ? "rotateZ(180deg)" : "none",
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.short,
          }}
        />
      </DrawerToggleButton>
    </Box>
  );
};

export default NavOpenButton;
