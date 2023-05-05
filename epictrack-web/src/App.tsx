import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import UserService from "./services/userService";
import AuthenticatedRoutes from "./routes/AuthenticatedRoutes";
import { useAppDispatch } from "./hooks";
import { Box } from "@mui/material";

export default function App() {
  const dispatch = useAppDispatch();
  const drawerWidth = 280;
  React.useEffect(() => {
    UserService.initKeycloak(dispatch);
  }, [dispatch]);
  return (
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
          <AuthenticatedRoutes />
        </Box>
      </Box>
    </Router>
  );
}
