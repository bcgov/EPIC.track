import * as React from "react";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { Fab, Menu } from "@mui/material";
import SupportCenterMenuItem from "./SupportCenterMenuItem";

export default function AppHelpButton() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleClick}
        size="small"
      >
        <QuestionMarkIcon />
      </Fab>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        disableEnforceFocus
      >
        <SupportCenterMenuItem />
      </Menu>
    </>
  );
}
