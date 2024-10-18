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
  useMediaQuery,
  Theme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import { RouteType, Routes } from "./SideNavElements";
import { Palette } from "../../../styles/theme";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import Icons from "../../icons";
import { groupBy } from "../../../utils";
import { IconProps } from "../../icons/type";
import { ETSubhead } from "../../shared";
import { hasPermission } from "../../shared/restricted";
import { toggleDrawer } from "styles/uiStateSlice";
import MiniDrawer from "./MiniDrawer";
import NavOpenButton from "./NavOpenButton";
import { AppConfig } from "config";

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

export const DrawerBox = ({ open = true }: { open?: boolean }) => {
  const navigate = useNavigate();
  const [subMenuExpand, setSubMenuExpand] = React.useState<{
    [x: string]: boolean;
  }>({});
  const { toggleDrawerMarginTop } = useAppSelector((state) => state.uiState);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const location = useLocation();

  const dispatch = useAppDispatch();

  const handleClick = (route: any) => {
    if (route.routes && route.routes.length > 0) {
      if (!open) {
        dispatch(toggleDrawer());
      }
      setSubMenuExpand((prevState: any) => ({
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
        overflowY: "auto",
        overflowX: "hidden",
        height: "100%",
        background: Palette.primary.main,
        padding: "16px 0px 0px 0px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <List
        sx={{
          paddingTop: toggleDrawerMarginTop,
          backgroundColor: "inherit",
        }}
      >
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
                          sx={{
                            justifyContent: open ? "initial" : "initial",
                          }}
                        >
                          {route.icon && (
                            <ListItemIconStyled
                              key={`lsticon-${groupKey}${i}`}
                              sx={{
                                minWidth: 0,
                                mr: open ? 3 : "auto",
                                justifyContent: "center",
                              }}
                            >
                              {renderIcon(
                                route.icon,
                                location.pathname === route.path
                              )}
                            </ListItemIconStyled>
                          )}
                          <ListItemText
                            key={`lsttext-${groupKey}${i}`}
                            sx={{ opacity: open ? 1 : 0 }}
                          >
                            <ETSubhead
                              className={`sidebar-item ${
                                location.pathname === route.path ? "active" : ""
                              }`}
                            >
                              {route.name}
                            </ETSubhead>
                          </ListItemText>
                          {open &&
                            route?.routes &&
                            (route?.routes?.length > 0 &&
                            !!subMenuExpand[route.name] ? (
                              <ExpandLess className="sidebar-item" />
                            ) : (
                              <ExpandMore className="sidebar-item" />
                            ))}
                        </ListItemButtonStyled>
                      </ListItemStyled>
                      {route.routes && route.routes?.length > 0 && (
                        <Collapse
                          in={!!subMenuExpand[route.name]}
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
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          color: Palette.white,
          marginBottom: "2em",
        }}
      >
        <ETSubhead>
          {open ? `Version: ${AppConfig.version}` : AppConfig.version}
        </ETSubhead>
      </Box>
    </Box>
  );
};

const SideNav = () => {
  const { isDrawerExpanded: open } = useAppSelector((state) => state.uiState);
  const isMediumScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("md")
  );
  const dispatch = useAppDispatch();
  const handleToggleDrawer = () => {
    dispatch(toggleDrawer());
  };

  if (!isMediumScreen) {
    return (
      <Drawer
        sx={{
          width: "15%",
          backgroundColor: Palette.primary.main,
        }}
        onClose={handleToggleDrawer}
        anchor={"left"}
        open={open}
        hideBackdrop={!open}
      >
        <Toolbar />
        <DrawerBox />
      </Drawer>
    );
  }

  return (
    <>
      <MiniDrawer />
      <NavOpenButton />
    </>
  );
};

export default SideNav;
