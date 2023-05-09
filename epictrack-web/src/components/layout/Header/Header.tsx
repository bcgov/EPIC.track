import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { useMediaQuery, Theme, IconButton, Button } from "@mui/material";
import { When } from "react-if";
import MenuIcon from "@mui/icons-material/Menu";
import CssBaseline from "@mui/material/CssBaseline";
import EnvironmentBanner from "./EnvironmentBanner";
import SideNav from "../SideNav/SideNav";
import { EpicTrackH1 } from "../../shared";
import UserService from "../../../services/userService";
import { UIState } from "../../../styles/type";
import { useAppSelector } from "../../../hooks";
import logoPath from "../../../assets/images/bcgovlogo.png";

const Header = () => {
  const [open, setOpen] = React.useState(false);
  const isMediumScreen: boolean = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("md")
  );
  const uiState: UIState = useAppSelector((state) => state.uiState);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme: Theme) =>
            isMediumScreen ? theme.zIndex.drawer + 1 : theme.zIndex.drawer,
        }}
        data-testid="appbar-header"
      >
        <CssBaseline />
        <Toolbar>
          <When condition={!isMediumScreen}>
            <IconButton
              component={MenuIcon}
              color="info"
              sx={{
                height: "2em",
                width: "2em",
                marginRight: { xs: "1em" },
              }}
              onClick={() => setOpen(!open)}
            />
          </When>
          <Box
            component="img"
            sx={{
              height: "5em",
              width: { xs: "7em" },
              marginRight: { xs: "1em", md: "3em" },
            }}
            src={logoPath}
            alt="British Columbia Logo"
          />
          {isMediumScreen ? (
            <EpicTrackH1 sx={{ flexGrow: 1 }}>EPIC Track</EpicTrackH1>
          ) : (
            <EpicTrackH1 sx={{ flexGrow: 1 }}>EPIC Track</EpicTrackH1>
          )}
          <Button
            data-testid="button-header"
            color="inherit"
            onClick={() => UserService.doLogout()}
          >
            Logout
          </Button>
        </Toolbar>
        <EnvironmentBanner />
      </AppBar>
      <SideNav
        setOpen={setOpen}
        data-testid="sidenav-header"
        isMediumScreen={isMediumScreen}
        open={open}
        drawerWidth={uiState.drawerWidth}
      />
    </>
  );
};

export default Header;
