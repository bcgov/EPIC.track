import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import UserService from "./services/userService";
import AuthenticatedRoutes from "./routes/AuthenticatedRoutes";
import { useAppDispatch, useAppSelector } from "./hooks";
import { Box, Theme, useMediaQuery, useTheme } from "@mui/material";
import AxiosErrorHandler from "./components/axiosErrorHandler/AxiosErrorHandler";
import ETNotificationProvider from "./components/shared/notificationProvider/ETNotificationProvider";
import "./styles/App.scss";
import { Loader } from "./components/shared/loader";
import Confetti from "components/confetti/Confetti";
import { TrackErrorBoundary } from "TrackErrorBoundary";
import AppHelpButton from "components/AppHelpButton";

export function App() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(
    (state) => state.user?.authentication.authenticated
  );

  const isMediumScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("md")
  );
  const uiState = useAppSelector((state) => state.uiState);
  const drawerWidth = isMediumScreen ? uiState.drawerWidth : 0;
  React.useEffect(() => {
    UserService.initKeycloak(dispatch);
  }, [dispatch]);
  return (
    <AxiosErrorHandler>
      {isLoggedIn && (
        <Router>
          <TrackErrorBoundary>
            {uiState.showConfetti && <Confetti />}
            <Box sx={{ display: "flex" }}>
              <Header />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  width: `calc(100% - ${drawerWidth}px)`,
                  // marginTop: "17px",
                }}
              >
                <ETNotificationProvider preventDuplicate>
                  {/* <React.StrictMode> */}
                  <AuthenticatedRoutes />
                  <Loader />
                  <AppHelpButton />
                  {/* </React.StrictMode> */}
                </ETNotificationProvider>
              </Box>
            </Box>
          </TrackErrorBoundary>
        </Router>
      )}
    </AxiosErrorHandler>
  );
}
