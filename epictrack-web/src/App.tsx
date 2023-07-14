import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import UserService from "./services/userService";
import AuthenticatedRoutes from "./routes/AuthenticatedRoutes";
import { useAppDispatch, useAppSelector } from "./hooks";
import { Box, Theme, useMediaQuery } from "@mui/material";
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
