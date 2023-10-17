import { PopoverOrigin, SxProps } from "@mui/material";

export interface UserMenuProps {
  anchorEl: HTMLElement | null;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phone: string;
  onClose: (event: React.MouseEvent<HTMLElement>) => any;
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => any;
  origin?: PopoverOrigin;
  sx?: SxProps;
  id?: string;
}
