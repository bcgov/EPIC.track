import React, { useMemo } from "react";
import {
  ListItemButton,
  List,
  ListItem,
  Box,
  Drawer,
  Toolbar,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import { RouteType, Routes } from "./SideNavElements";
import { Palette } from "../../../styles/theme";
import { SideNavProps } from "./types";
import { useAppSelector } from "../../../hooks";
import Icons from "../../icons";
import { groupBy } from "../../../utils";
import { IconProps } from "../../icons/type";
import { ETSubhead } from "../../shared";
import { hasPermission } from "../../shared/restricted";

const ListItemStyled = styled(ListItem)({
  padding: "0px 0px 0px 0px",
});

const ListItemButtonStyled = styled(ListItemButton)({
  padding: "16px 24px 16px 24px",
  "& .sidebar-item": {
    fill: Palette.white,
    color: Palette.white,
  },
  "& .active": {
    color: Palette.secondary.main,
    fill: Palette.secondary.main,
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
  const uiState = useAppSelector((state) => state.uiState);
  const location = useLocation();
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const handleClick = (route: any) => {
    if (route.routes && route.routes.length > 0) {
      setOpen((prevState: any) => ({
        [route.name]: !prevState[route.name],
      }));
    } else {
      navigate(route.path);
    }
  };

  const renderIcon = React.useCallback((iconTitle: string, active: boolean) => {
    const Icon: React.FC<IconProps> = Icons[iconTitle];
    return <Icon className={`sidebar-item ${active ? "active" : ""}`} />;
  }, []);

  const isRouteAllowed = (route: RouteType, roles: Array<any>) => {
    const allowed = route["allowedRoles"] ?? [];
    return hasPermission({ roles, allowed }) || !route["isAuthenticated"];
  };

  const filterRoutes = (routes: RouteType[], roles: Array<any>) => {
    return routes.reduce((allowedRoutes: any, route) => {
      if (isRouteAllowed(route, roles)) {
        const newRoute: RouteType = { ...route };
        if (newRoute["routes"]) {
          newRoute["routes"] = filterRoutes(newRoute["routes"], roles);
        }

        const addRoute =
          (newRoute["routes"] && newRoute["routes"].length > 0) ||
          !newRoute["routes"];

        if (addRoute) {
          allowedRoutes.push(newRoute);
        }
      }
      return allowedRoutes;
    }, []);
  };

  const allowedRoutes: RouteType[] = filterRoutes(Routes, roles);

  const groupedRoutes = useMemo(
    () => groupBy(allowedRoutes, (p) => p.group),
    [allowedRoutes]
  );

  return (
    <Box
      data-testid={`sidenav`}
      sx={{
        overflow: "auto",
        height: "100%",
        background: Palette.primary.main,
        padding: "16px 0px 57px 0px",
      }}
    >
      <List sx={{ paddingTop: uiState.toggleDrawerMarginTop }}>
        <>
          {Object.keys(groupedRoutes).map((groupKey) => {
            return (
              <>
                {groupedRoutes[groupKey].map((route, i) => {
                  return (
                    <>
                      <ListItemStyled key={`${groupKey}${i}`}>
                        <ListItemButtonStyled
                          key={`lstbutton-${groupKey}${i}`}
                          data-testid={`SideNav/${route.name}-button`}
                          onClick={() => handleClick(route)}
                        >
                          {route.icon && (
                            <ListItemIconStyled key={`lsticon-${groupKey}${i}`}>
                              {renderIcon(
                                route.icon,
                                location.pathname === route.path
                              )}
                            </ListItemIconStyled>
                          )}
                          <ListItemText key={`lsttext-${groupKey}${i}`}>
                            <ETSubhead
                              className={`sidebar-item ${
                                location.pathname === route.path ? "active" : ""
                              }`}
                            >
                              {route.name}
                            </ETSubhead>
                          </ListItemText>
                          {route?.routes &&
                            (route?.routes?.length > 0 && !!open[route.name] ? (
                              <ExpandLess className="sidebar-item" />
                            ) : (
                              <ExpandMore className="sidebar-item" />
                            ))}
                        </ListItemButtonStyled>
                      </ListItemStyled>
                      {route.routes && route.routes?.length > 0 && (
                        <Collapse
                          in={!!open[route.name]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <List disablePadding key={`list-${route.name}`}>
                            {route.routes?.map((subRoute, i) => (
                              <ListItemStyled
                                key={`sub-list-${subRoute?.name}`}
                                data-testid={`SideNav/${subRoute.name}-button`}
                              >
                                <ListItemButtonStyled
                                  key={`sub-list-button-${subRoute?.name}`}
                                  onClick={() => handleClick(subRoute)}
                                >
                                  <ListItemText
                                    key={`sub-list-text-${subRoute?.name}`}
                                    sx={{
                                      marginLeft: "40px",
                                    }}
                                  >
                                    <ETSubhead
                                      className={`sidebar-item ${
                                        location.pathname === subRoute.path
                                          ? "active"
                                          : ""
                                      }`}
                                    >
                                      {subRoute.name}
                                    </ETSubhead>
                                  </ListItemText>
                                </ListItemButtonStyled>
                              </ListItemStyled>
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
