import { MenuItem, MenuItemProps } from "@mui/material";

export const HelpMenuItem = ({ children, ...rest }: MenuItemProps) => {
  return <MenuItem {...rest}>{children}</MenuItem>;
};
