import React from "react";
import {
  ListItemButton,
  List,
  ListItem,
  Box,
  Drawer,
  Toolbar,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import { Routes } from "./SideNavElements";
import { Palette } from "../../../styles/theme";
import { SideNavProps } from "./types";
import { useAppSelector } from "../../../hooks";
import Icons from "../../icons";
import { groupBy } from "../../../utils";

const ListItemButtonStyled = styled(ListItemButton)({
  padding: "16px 24px 16px 24px",
  "& .sidebar-item": {
    fill: Palette.white,
    color: Palette.white,
  },
  "& .active": {
    color: Palette.secondary.main,
  },
  "&:hover": {
    backgroundColor: Palette.secondary.main,
    color: Palette.primary.main,
    "& .sidebar-item": {
      fill: Palette.primary.main,
      color: Palette.primary.main,
    },
  },
});

const ListItemIconStyled = styled(ListItemIcon)({
  minWidth: "0px",
  marginRight: "16px",
});

const DrawerBox = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState<{ [x: string]: boolean }>({});
  const location = useLocation();
  const handleClick = (route: any) => {
    if (route.routes && route.routes.length > 0) {
      setOpen((prevState: any) => ({
        [route.name]: !prevState[route.name],
      }));
    } else {
      navigate(route.path);
    }
  };

  const groupedRoutes = React.useMemo(
    () => groupBy(Routes, (p) => p.group),
    []
  );

  return (
    <Box
      sx={{
        overflow: "auto",
        height: "100%",
        background: Palette.primary.main,
        padding: "16px 0px 57px 0px",
      }}
    >
      <List sx={{ paddingTop: "2.5em" }}>
        <>
          {Object.keys(groupedRoutes).map((groupKey) => {
            return (
              <>
                {groupedRoutes[groupKey].map((route, i) => {
                  console.log(groupKey, route.path);
                  return (
                    <>
                      <ListItem
                        key={i}
                        sx={{
                          padding: "0px 0px 0px 0px",
                        }}
                      >
                        <ListItemButtonStyled
                          data-testid={`SideNav/${route.name}-button`}
                          onClick={() => handleClick(route)}
                        >
                          {route.icon && (
                            <ListItemIconStyled>
                              {Icons[route.icon]}
                            </ListItemIconStyled>
                          )}
                          <ListItemText
                            primary={
                              <Typography
                                className={`sidebar-item ${
                                  location.pathname === route.path
                                    ? "active"
                                    : ""
                                }`}
                              >
                                {route.name}
                              </Typography>
                            }
                          />
                          {route?.routes &&
                            (route?.routes?.length > 0 && !!open[route.name] ? (
                              <ExpandLess className="sidebar-item" />
                            ) : (
                              <ExpandMore className="sidebar-item" />
                            ))}
                        </ListItemButtonStyled>
                      </ListItem>
                      {route.routes && route.routes?.length > 0 && (
                        <Collapse
                          in={!!open[route.name]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <List disablePadding key={`list-${route.name}`}>
                            {route.routes?.map((subRoute, i) => (
                              <ListItem
                                key={`sub-list-${subRoute?.name}`}
                                sx={{
                                  paddingLeft: "0px",
                                  paddingRight: "0px",
                                }}
                              >
                                <ListItemButtonStyled
                                  onClick={() => handleClick(subRoute)}
                                >
                                  <ListItemText
                                    sx={{
                                      marginLeft: "40px",
                                    }}
                                    primary={
                                      <Typography
                                        className={`sidebar-item ${
                                          location.pathname === subRoute.path
                                            ? "active"
                                            : ""
                                        }`}
                                      >
                                        {subRoute.name}
                                      </Typography>
                                    }
                                  />
                                </ListItemButtonStyled>
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      )}
                    </>
                  );
                })}
                <ListItem
                  sx={{
                    height: "1.5rem",
                  }}
                ></ListItem>
              </>
            );
          })}
        </>
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
  const uiState = useAppSelector((state) => state.uiState);
  return (
    <>
      {isMediumScreen ? (
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
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
