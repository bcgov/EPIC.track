import React from "react";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import {
  useMediaQuery,
  Theme,
  IconButton,
  Avatar,
  styled,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CssBaseline from "@mui/material/CssBaseline";
import EnvironmentBanner from "./EnvironmentBanner";
import SideNav from "../SideNav/SideNav";
import { UIState } from "../../../styles/type";
import { useAppSelector } from "../../../hooks";
import BCGovLogo from "../../../assets/images/bcgovLogoWhite.svg";
import EpicTrackLogo from "../../../assets/images/epicTrackLogo.svg";
import { ETCaption2, ETSubhead } from "../../shared";
import { Palette } from "../../../styles/theme";
import UserMenu from "../../shared/userMenu/UserMenu";
import { HEADER_HEIGHT } from "./constants";
import { useDispatch } from "react-redux";
import { toggleDrawer } from "styles/uiStateSlice";
import { Unless } from "react-if";

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // ...(open && {
  //   marginLeft: 260,
  //   width: `calc(100% - ${260}px)`,
  //   transition: theme.transitions.create(["width", "margin"], {
  //     easing: theme.transitions.easing.sharp,
  //     duration: theme.transitions.duration.enteringScreen,
  //   }),
  // }),
}));

const Header = () => {
  const { isDrawerExpanded: open }: UIState = useAppSelector(
    (state) => state.uiState
  );
  const dispatch = useDispatch();

  const user = useAppSelector((state) => state.user.userDetail);
  const isMediumScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("md")
  );

  const [profileMenuAnchorEl, setProfileMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(null);
  };

  return (
    <>
      <AppBar position="fixed" open={open} data-testid="appbar-header">
        <CssBaseline />
        <Toolbar
          sx={{
            height: HEADER_HEIGHT,
          }}
        >
          <Unless condition={isMediumScreen}>
            <IconButton
              data-testid="menu-icon"
              component={MenuIcon}
              color="info"
              sx={{
                height: "2em",
                width: "2em",
                marginRight: { xs: "1em" },
              }}
              onClick={() => {
                dispatch(toggleDrawer());
              }}
            />
          </Unless>
          <Box
            component="img"
            sx={{
              height: "5em",
              width: { xs: "7em" },
              marginRight: { xs: "1em", md: "2em" },
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
          {/* User menu */}
          <Box
            sx={{
              flexGrow: 0,
              display: "flex",
              alignItems: "baseline",
              gap: "1rem",
            }}
            data-testid="user-menu-box"
            onMouseEnter={handleOpenProfileMenu}
            onMouseLeave={handleCloseProfileMenu}
          >
            <ETSubhead>Hello, {user.firstName}</ETSubhead>
            <Avatar
              sx={{
                bgcolor: Palette.white,
                color: Palette.primary.main,
                fontSize: "1rem",
                lineHeight: "1.3rem",
                fontWeight: 700,
                width: "2rem",
                height: "2rem",
              }}
            >
              <ETCaption2
                bold
              >{`${user.firstName[0]}${user.lastName[0]}`}</ETCaption2>
            </Avatar>
            <UserMenu
              data-testid="user-menu"
              anchorEl={profileMenuAnchorEl}
              email={user.email}
              phone={user.phone}
              position={user.position}
              firstName={user.firstName}
              lastName={user.lastName}
              onClose={handleCloseProfileMenu}
            />
          </Box>
        </Toolbar>
        <EnvironmentBanner />
      </AppBar>
      <SideNav data-testid="sidenav-header" />
    </>
  );
};

export default Header;
