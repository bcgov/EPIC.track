export interface UserMenuProps {
  anchorEl: HTMLElement | null;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phone: string;
  onClose: (event: React.MouseEvent<HTMLElement>) => any;
}
