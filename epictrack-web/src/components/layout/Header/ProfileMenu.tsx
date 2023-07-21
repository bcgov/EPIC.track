import React from "react";
import Box from "@mui/material/Box";
import { Palette } from "../../../styles/theme";
import { useAppSelector } from "../../../hooks";
import { makeStyles } from "@mui/styles";
import { Menu, Avatar, Tooltip, IconButton } from "@mui/material";
import { ETCaption2, ETSubhead } from "../../shared";
import { IconProps } from "../../icons/type";
import Icons from "../../icons";
import { showNotification } from "../../shared/notificationProvider";

const CopyOutlinedIcon: React.FC<IconProps> = Icons["CopyOutlinedIcon"];
const CopyFilledIcon: React.FC<IconProps> = Icons["CopyFilledIcon"];

const useButtonStyles = makeStyles({
  copyIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "4px",
    "& .profile-menu-icon ": {
      color: Palette.white,
      fill: Palette.primary.accent.main,
    },
  },
});

const useStyles = makeStyles({
  menuItemWrapper: {
    display: "flex",
    gap: "8px",
    padding: "1rem",
  },
  menuItem: {
    display: "flex",
    flexDirection: "column",
  },
  contactInfo: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  },
  avatar: {
    fontSize: "1rem",
    lineHeight: "1.3rem",
    fontWeight: 700,
    width: "2rem",
    height: "2rem",
  },
});

const CopyButton = ({ ...props }) => {
  const classes = useButtonStyles();

  const copyHandler = (text: string) => {
    showNotification("Copied to clipboard", { type: "success" });
    navigator.clipboard.writeText(text);
  };

  const [hover, setHover] = React.useState<boolean>(false);
  return (
    <IconButton
      onClick={() => copyHandler(props.copyText)}
      className={classes.copyIcon}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover ? (
        <CopyFilledIcon className="profile-menu-icon" />
      ) : (
        <CopyOutlinedIcon className="profile-menu-icon" />
      )}
    </IconButton>
  );
};
const ProfileMenu = () => {
  const user = useAppSelector((state) => state.user.userDetail);

  const [profileMenuAnchorEl, setProfileMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(null);
  };

  const classes = useStyles();

  return (
    <Box
      sx={{
        flexGrow: 0,
        display: "flex",
        alignItems: "baseline",
        gap: "1rem",
      }}
      onMouseEnter={handleOpenProfileMenu}
      onMouseLeave={handleCloseProfileMenu}
    >
      <ETSubhead>Hello, {user.firstName}</ETSubhead>
      <Avatar
        sx={{
          bgcolor: Palette.white,
          color: Palette.primary.main,
        }}
        className={classes.avatar}
      >
        <ETCaption2
          bold
        >{`${user.firstName[0]}${user.lastName[0]}`}</ETCaption2>
      </Avatar>
      <Menu
        sx={{
          mt: "2.5rem",
        }}
        id="menu-appbar"
        anchorEl={profileMenuAnchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(profileMenuAnchorEl)}
        onClose={handleCloseProfileMenu}
        style={{ pointerEvents: "none" }}
        PaperProps={{
          style: {
            pointerEvents: "auto",
            width: 320,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
        }}
        MenuListProps={{
          style: {
            paddingTop: 0,
            paddingBottom: 0,
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              bgcolor: Palette.neutral.bg.light,
              borderBottom: `1px solid ${Palette.neutral.bg.dark}`,
              alignItems: "center",
            }}
            className={classes.menuItemWrapper}
          >
            <Avatar
              sx={{
                bgcolor: Palette.primary.main,
                color: Palette.white,
              }}
              className={classes.avatar}
            >
              <ETCaption2
                bold
              >{`${user.firstName[0]}${user.lastName[0]}`}</ETCaption2>
            </Avatar>
            <Box sx={{ gap: "8px" }} className={classes.menuItem}>
              <ETCaption2 bold>
                {`${user.firstName} ${user.lastName}`}
              </ETCaption2>
              <ETCaption2>{user.position}</ETCaption2>
            </Box>
          </Box>
          <Box
            sx={{ flexDirection: "column" }}
            className={classes.menuItemWrapper}
          >
            <ETCaption2 bold>Contact</ETCaption2>
            <Box className={classes.menuItem}>
              <Box className={classes.contactInfo}>
                <Tooltip title={user.email} arrow>
                  <ETCaption2
                    color={Palette.primary.accent.main}
                    sx={{ flexGrow: 1 }}
                    noWrap
                  >
                    {user.email}
                  </ETCaption2>
                </Tooltip>
                <CopyButton copyText={user.email} />
              </Box>
              {user.phone && (
                <Box className={classes.contactInfo}>
                  <Tooltip title={user.phone} arrow>
                    <ETCaption2
                      color={Palette.primary.accent.main}
                      sx={{ flexGrow: 1 }}
                      noWrap
                    >
                      {user.phone}
                    </ETCaption2>
                  </Tooltip>
                  <CopyButton copyText={user.phone} />
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Menu>
    </Box>
  );
};

export default ProfileMenu;
