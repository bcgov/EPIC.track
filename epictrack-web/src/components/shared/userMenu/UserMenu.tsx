import React from "react";
import {
  Avatar,
  Box,
  Menu,
  PopoverOrigin,
  SxProps,
  Tooltip,
} from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption2 } from "..";
import { UserMenuProps } from "./type";
import CopyButton from "../CopyButton";

const menuItemWrapper: SxProps = {
  display: "flex",
  gap: "8px",
  padding: "1rem",
};
const menuItem: SxProps = {
  display: "flex",
  flexDirection: "column",
};
const contactInfo: SxProps = {
  display: "flex",
  gap: "1.5rem",
  alignItems: "center",
};

const UserMenu = (props: UserMenuProps) => {
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
    ...rest
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
      {...rest}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column" }}
        data-cy={"user-menu"}
      >
        <Box
          sx={{
            ...menuItemWrapper,
            bgcolor: Palette.neutral.bg.light,
            borderBottom: `1px solid ${Palette.neutral.bg.dark}`,
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              bgcolor: Palette.primary.main,
              color: Palette.white,
              fontSize: "1rem",
              lineHeight: "1.3rem",
              fontWeight: 700,
              width: "2rem",
              height: "2rem",
            }}
          >
            <ETCaption2 bold>{`${firstName[0]}${lastName[0]}`}</ETCaption2>
          </Avatar>
          <Box
            sx={{
              ...menuItem,
              gap: "8px",
            }}
          >
            <ETCaption2
              bold
              data-cy="user-name"
            >{`${firstName} ${lastName}`}</ETCaption2>
            <ETCaption2 data-cy="user-position">{position}</ETCaption2>
          </Box>
        </Box>
        <Box
          sx={{
            ...menuItemWrapper,
            flexDirection: "column",
          }}
        >
          <ETCaption2 bold>Contact</ETCaption2>
          <Box
            sx={{
              ...menuItem,
            }}
          >
            <Box
              sx={{
                ...contactInfo,
              }}
            >
              <ETCaption2
                color={Palette.primary.accent.main}
                sx={{ flexGrow: 1 }}
                noWrap
                data-cy="user-email"
              >
                {email}
              </ETCaption2>
              <CopyButton copyText={email} />
            </Box>
            {phone && (
              <Box
                sx={{
                  ...contactInfo,
                }}
              >
                <ETCaption2
                  data-cy="user-phone"
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
