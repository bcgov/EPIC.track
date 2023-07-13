import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import UserService from "./services/userService";
import AuthenticatedRoutes from "./routes/AuthenticatedRoutes";
import { useAppDispatch, useAppSelector } from "./hooks";
import { Box, IconButton, Theme, useMediaQuery } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Palette } from "./styles/theme";
import { toggleDrawer } from "./styles/uiStateSlice";
import { Else, If, Then } from "react-if";
import "./styles/App.scss";

export default function App() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(
    (state) => state.user.authentication.authenticated
  );
  const isMediumScreen: boolean = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("md")
  );
  const uiState = useAppSelector((state) => state.uiState);
  const drawerWidth = uiState.drawerWidth;
  React.useEffect(() => {
    UserService.initKeycloak(dispatch);
  }, [dispatch]);
  return (
    <>
      {isLoggedIn && (
        <Router>
          <Box sx={{ display: "flex" }}>
            <Header />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                width: `calc(100% - ${drawerWidth}px)`,
                marginTop: "17px",
              }}
            >
              {/* <If condition={isMediumScreen}>
                <Box
                  sx={{
                    width: "2rem",
                    height: "3rem",
                    background: Palette.primary.main,
                    position: "fixed",
                    marginTop: uiState.toggleDrawerMarginTop,
                    borderRadius: "0px 4px 4px 0px",
                    boxShadow: "0px 5px 9px rgba(0, 0, 0, 0.25)",
                    display: "flex",
                    flexWrap: "wrap",
                    alignContent: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <IconButton
                    sx={{
                      color: "white",
                    }}
                    onClick={() => dispatch(toggleDrawer())}
                  >
                    <If condition={uiState.isDrawerExpanded}>
                      <Then>
                        <ArrowBackIosIcon
                          sx={{
                            fontSize: "1.5rem",
                          }}
                        />
                      </Then>
                      <Else>
                        <ArrowForwardIosIcon />
                      </Else>
                    </If>
                  </IconButton>
                </Box>
              </If> */}
              <React.StrictMode>
                <AuthenticatedRoutes />
              </React.StrictMode>
            </Box>
          </Box>
        </Router>
      )}
    </>
  );
}
