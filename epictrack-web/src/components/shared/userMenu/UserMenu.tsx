import React from "react";
import { Avatar, Box, Menu, PopoverOrigin, Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Palette } from "../../../styles/theme";
import { ETCaption2 } from "..";
import { UserMenuProps } from "./type";
import CopyButton from "../CopyButton";

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

const UserMenu = (props: UserMenuProps) => {
  const classes = useStyles();
  const {
    anchorEl,
    onClose,
    firstName,
    lastName,
    position,
    email,
    phone,
    origin,
    id,
  } = props;
  const menuOrigin = React.useMemo(() => {
    if (origin === undefined)
      return {
        vertical: "top",
        horizontal: "right",
      } as PopoverOrigin;
    return origin;
  }, [origin]);
  return (
    <Menu
      sx={{
        mt: "2.5rem",
        ...props.sx,
      }}
      id={id || "menu-appbar"}
      anchorEl={anchorEl}
      anchorOrigin={menuOrigin}
      keepMounted
      transformOrigin={menuOrigin}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        style: {
          pointerEvents: "none",
          width: 320,
          boxShadow: "0px 12px 24px 0px rgba(0, 0, 0, 0.10)",
        },
      }}
      MenuListProps={{
        style: {
          paddingTop: 0,
          paddingBottom: 0,
          pointerEvents: "auto",
        },
      }}
      container={document.body}
      disablePortal
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
            <ETCaption2 bold>{`${firstName[0]}${lastName[0]}`}</ETCaption2>
          </Avatar>
          <Box sx={{ gap: "8px" }} className={classes.menuItem}>
            <ETCaption2 bold>{`${firstName} ${lastName}`}</ETCaption2>
            <ETCaption2>{position}</ETCaption2>
          </Box>
        </Box>
        <Box
          sx={{ flexDirection: "column" }}
          className={classes.menuItemWrapper}
        >
          <ETCaption2 bold>Contact</ETCaption2>
          <Box className={classes.menuItem}>
            <Box className={classes.contactInfo}>
              <ETCaption2
                color={Palette.primary.accent.main}
                sx={{ flexGrow: 1 }}
                noWrap
              >
                {email}
              </ETCaption2>
              <CopyButton copyText={email} />
            </Box>
            {phone && (
              <Box className={classes.contactInfo}>
                <ETCaption2
                  color={Palette.primary.accent.main}
                  sx={{ flexGrow: 1 }}
                  noWrap
                >
                  {phone}
                </ETCaption2>
                <CopyButton copyText={phone} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Menu>
  );
};

export default UserMenu;
