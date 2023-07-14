import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { useMediaQuery, Theme, IconButton, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CssBaseline from "@mui/material/CssBaseline";
import EnvironmentBanner from "./EnvironmentBanner";
import SideNav from "../SideNav/SideNav";
import UserService from "../../../services/userService";
import { UIState } from "../../../styles/type";
import { useAppSelector } from "../../../hooks";
import BCGovLogo from "../../../assets/images/bcgovLogoWhite.svg";
import EpicTrackLogo from "../../../assets/images/epicTrackLogo.svg";

import ProfileMenu from "./ProfileMenu";

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
          {!isMediumScreen && (
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
          )}
          <Box
            component="img"
            sx={{
              height: "5em",
              width: { xs: "7em" },
              marginRight: { xs: "1em", md: "2em" },
              marginLeft: { xs: "1em", md: "2em" },
            }}
            src={BCGovLogo}
            alt="British Columbia"
          />
          <Box sx={{ flexGrow: 1, display: "flex" }}>
            <Box
              component="img"
              sx={{
                height: "5em",
                width: { xs: "7em" },
                marginRight: { xs: "1em", md: "3em" },
              }}
              src={EpicTrackLogo}
              alt="EPIC.track"
            />
          </Box>
          <ProfileMenu />
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
