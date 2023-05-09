import React from "react";
import {
  ListItemButton,
  List,
  ListItem,
  Box,
  Drawer,
  Toolbar,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import { Routes } from "./SideNavElements";
import { Palette } from "../../../styles/theme";
import { SideNavProps } from "./types";
import { When, Unless } from "react-if";
import { EpicTrackH4, EpicTrackH5 } from "../../shared";

const DrawerBox = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState<{ [x: string]: boolean }>({});
  const location = useLocation();

  const getCurrentBaseRoute = () => {
    return Routes.map((route) => route.base)
      .filter((route) => location.pathname.includes(route))
      .reduce((prev, curr) => (prev.length > curr.length ? prev : curr));
  };
  const handleClick = (route: any) => {
    if (route.routes && route.routes.length > 0) {
      setOpen((prevState: any) => ({
        ...open,
        [route.name]: !prevState[route.name],
      }));
    } else {
      navigate(route.path);
    }
  };

  const currentBaseRoute = getCurrentBaseRoute();

  return (
    <Box
      sx={{
        overflow: "auto",
        height: "100%",
        background: Palette.primary.main,
      }}
    >
      <List sx={{ paddingTop: "2.5em" }}>
        {Routes.map((route) => (
          <>
            <ListItem key={route.name}>
              <ListItemButton
                key={`btn-${route.name}`}
                data-testid={`SideNav/${route.name}-button`}
                onClick={() => handleClick(route)}
                sx={{
                  "&:hover": {
                    backgroundColor: Palette.hover.light,
                  },
                }}
              >
                <When condition={currentBaseRoute === route.base}>
                  <EpicTrackH4 color={Palette.secondary.main}>
                    {route.name}
                  </EpicTrackH4>
                </When>
                <Unless condition={currentBaseRoute === route.base}>
                  <EpicTrackH4 color={"white"}>{route.name}</EpicTrackH4>
                </Unless>
                <When condition={route.routes && route.routes?.length > 0}>
                  {open ? <ExpandLess /> : <ExpandMore />}
                </When>
              </ListItemButton>
            </ListItem>
            <When condition={route.routes && route.routes?.length > 0}>
              <Collapse in={!!open[route.name]} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {route.routes?.map((subRoute) => (
                    <ListItem key={subRoute.name}>
                      <ListItemButton
                        key={`btn=${subRoute.name}`}
                        onClick={() => handleClick(subRoute)}
                      >
                        <When condition={location.pathname === subRoute.base}>
                          <EpicTrackH5
                            color={Palette.secondary.main}
                            sx={{
                              ml: "0.5rem",
                            }}
                          >
                            {subRoute.name}
                          </EpicTrackH5>
                        </When>
                        <Unless condition={location.pathname === subRoute.base}>
                          <EpicTrackH5
                            color={"white"}
                            sx={{
                              ml: "0.5rem",
                            }}
                          >
                            {subRoute.name}
                          </EpicTrackH5>
                        </Unless>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </When>
          </>
        ))}
      </List>
    </Box>
  );
};

const SideNav = ({
  open,
  setOpen,
  isMediumScreen,
  drawerWidth,
}: SideNavProps) => {
  return (
    <>
      {isMediumScreen ? (
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            transition: "all 0.25s",
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: Palette.primary.main,
            },
          }}
        >
          <Toolbar />
          <DrawerBox />
        </Drawer>
      ) : (
        <Drawer
          sx={{
            width: "15%",
            background: Palette.primary.main,
          }}
          onClose={() => setOpen(false)}
          anchor={"left"}
          open={open}
          hideBackdrop={!open}
        >
          <DrawerBox />
        </Drawer>
      )}
    </>
  );
};

export default SideNav;
