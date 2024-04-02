import * as React from "react";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { Fab, Menu, MenuItem, MenuItemProps } from "@mui/material";
import { Palette } from "styles/theme";

const HelpMenuItem = ({ children, ...rest }: MenuItemProps) => {
  return (
    <MenuItem
      sx={{
        backgroundColor: Palette.primary.main,
        color: Palette.white,
        "&:hover": {
          backgroundColor: Palette.primary.main,
        },
      }}
      {...rest}
    >
      {children}
    </MenuItem>
  );
};

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
        <HelpMenuItem onClick={handleClose}>Support Center</HelpMenuItem>
      </Menu>
    </>
  );
}
