import { MenuItem, MenuItemProps } from "@mui/material";
import { Palette } from "styles/theme";

export const HelpMenuItem = ({ children, ...rest }: MenuItemProps) => {
  return <MenuItem {...rest}>{children}</MenuItem>;
};
