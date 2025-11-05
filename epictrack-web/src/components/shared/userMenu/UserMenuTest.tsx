import React from "react";
import { Button } from "@mui/material";
import { UserMenuProps } from "./type";
import UserMenu from "./UserMenu";

const UserMenuTest = (props: UserMenuProps) => {
  const { anchorEl } = props;

  const [anchorElState, setAnchorElState] = React.useState<null | HTMLElement>(
    anchorEl,
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
