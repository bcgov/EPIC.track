import * as React from "react";
import { styled, Theme, CSSObject, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import { DrawerBox } from "../SideNav";
import { useAppSelector } from "hooks";
import { drawerCollapsedWidth, drawerExpandedWidth } from "styles/uiStateSlice";
import { Palette } from "styles/theme";

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerExpandedWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerExpandedWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MiniDrawer() {
  const { isDrawerExpanded: open } = useAppSelector((state) => state.uiState);
  const [isHovering, setIsHovering] = React.useState(false);

  const theme = useTheme();

  const handleOnMouseEnter = () => {
    setIsHovering(true);
  };

  const handleOnMouseLeave = () => {
    setIsHovering(false);
  };

  if (!open && isHovering) {
    return (
      <>
        <span
          style={{
            width: drawerCollapsedWidth,
            height: "100%",
            position: "relative",
            top: 0,
            left: 0,
            zIndex: theme.zIndex.drawer,
            backgroundColor: "transparent",
          }}
        />
        <MuiDrawer
          sx={{
            width: drawerExpandedWidth,
            background: Palette.primary.main,
          }}
          anchor={"left"}
          open={true}
          hideBackdrop={true}
          onMouseLeave={handleOnMouseLeave}
        >
          <DrawerHeader />
          <DrawerBox open={true} />
        </MuiDrawer>
      </>
    );
  }

  return (
    <Drawer
      variant={"permanent"}
      open={open}
      onMouseEnter={open ? undefined : handleOnMouseEnter}
    >
      <DrawerHeader />
      <Divider />
      <DrawerBox open={open} />
    </Drawer>
  );
}
