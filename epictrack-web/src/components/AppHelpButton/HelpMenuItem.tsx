import { MenuItem, MenuItemProps } from "@mui/material";
import { Palette } from "styles/theme";

export const HelpMenuItem = ({ children, ...rest }: MenuItemProps) => {
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
