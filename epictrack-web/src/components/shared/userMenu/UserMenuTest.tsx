import React from "react";
import {
  Avatar,
  Box,
  Button,
  Menu,
  PopoverOrigin,
  SxProps,
  Tooltip,
} from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption2 } from "..";
import { UserMenuProps } from "./type";
import CopyButton from "../CopyButton";
import UserMenu from "./UserMenu";

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

const UserMenuTest = (props: UserMenuProps) => {
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

  const [anchorElState, setAnchorElState] = React.useState<null | HTMLElement>(
    anchorEl
  );

  return (
    <>
      <Button
        data-cy="open-menu-button"
        onClick={(e) => setAnchorElState(e.currentTarget)}
      >
        Open Menu
      </Button>
      <UserMenu {...props} anchorEl={anchorElState} />
    </>
  );
};

export default UserMenuTest;
