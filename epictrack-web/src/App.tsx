import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import UserService from "./services/userService";
import AuthenticatedRoutes from "./routes/AuthenticatedRoutes";
import { useAppDispatch, useAppSelector } from "./hooks";
import { Box, Theme, useMediaQuery } from "@mui/material";
import AxiosErrorHandler from "./components/axiosErrorHandler/AxiosErrorHandler";
import ETNotificationProvider from "./components/shared/notificationProvider/ETNotificationProvider";
import "./styles/App.scss";
import { Loader } from "./components/shared/loader";
import Confetti from "components/confetti/Confetti";
import { TrackErrorBoundary } from "TrackErrorBoundary";
import AppHelpButton from "components/AppHelpButton";
import { recordAnalytics } from "@epic/centre-analytics";
import { AppConfig } from "./config";

export function App() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(
    (state) => state.user?.authentication.authenticated,
  );

  const bearerToken = useAppSelector((state) => state.user?.bearerToken);
  const userDetail = useAppSelector((state) => state.user?.userDetail);

  useEffect(() => {
    if (!AppConfig.centreApiUrl || !isLoggedIn || !bearerToken || !userDetail)
      return;
    recordAnalytics({
      appName: "epic_track",
      centreApiUrl: AppConfig.centreApiUrl,
      enabled: true,
      authState: {
        user: {
          access_token: bearerToken,
          profile: {
            preferred_username: userDetail.preferred_username,
            sub: userDetail.sub,
          },
        },
        isAuthenticated: true,
      },
    }).catch((error) => {
      console.log("Failed to record analytics:", error);
    });
  }, [isLoggedIn, bearerToken, userDetail]);

  const isMediumScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("md"),
  );
  const uiState = useAppSelector((state) => state.uiState);
  const drawerWidth = isMediumScreen ? uiState.drawerWidth : 0;

  useEffect(() => {
    if (window.location.pathname === "/") {
      window.location.replace(`/track${window.location.search}${window.location.hash}`);
      return;
    }

    const redirectUrl = window.sessionStorage.getItem("redirectUrl");
    if (!redirectUrl) {
      const cleanPathname = window.location.pathname.replace(/^\/track/, "");
      window.sessionStorage.setItem(
        "redirectUrl",
        cleanPathname + window.location.search,
      );
    }
    UserService.initKeycloak(dispatch);
  }, [dispatch]);

  return (
    <AxiosErrorHandler>
      {isLoggedIn && (
        <Router basename="/track">
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
