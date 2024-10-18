import { Avatar } from "@mui/material";
import React, { useEffect } from "react";
import { Staff } from "../../../../models/staff";
import { ETCaption2 } from "../../../shared";
import UserMenu from "../../../shared/userMenu/UserMenu";
import debounce from "lodash/debounce";
import { AVATAR_HEIGHT, AVATAR_WIDTH } from "./constants";
import { useAppSelector } from "../../../../hooks";
import { Palette } from "../../../../styles/theme";

interface CardProps {
  staff: Staff;
}
const StaffAvatar = ({ staff }: CardProps) => {
  const [userMenuAnchorEl, setUserMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const { email } = useAppSelector((state) => state.user.userDetail);

  const [inAvatar, setInAvatar] = React.useState<boolean>(false);
  const [inUserMenu, setInUserMenu] = React.useState<boolean>(false);

  const debouncedCloseUserMenu = debounce(() => {
    setInAvatar(false);
  }, 100);

  const ref = React.useRef<any>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    if (!inAvatar && !inUserMenu) {
      setUserMenuAnchorEl(null);
    }
  }, [inAvatar, inUserMenu]);

  const isLoggedUser = staff?.email === email;

  if (!staff) return null;

  return (
    <>
      <Avatar
        ref={ref}
        key={staff.id}
        sx={{
          width: AVATAR_WIDTH,
          height: AVATAR_HEIGHT,
          bgcolor: isLoggedUser
            ? Palette.primary.main
            : Palette.neutral.bg.main,
          color: isLoggedUser ? Palette.white : Palette.neutral.dark,
        }}
        onMouseEnter={(event) => {
          handleOpenUserMenu(event);
          setInAvatar(true);
        }}
        onMouseLeave={() => debouncedCloseUserMenu()}
      >
        <ETCaption2>{`${staff.first_name[0] || "X"}${
          staff.last_name[0] || "X"
        }`}</ETCaption2>
      </Avatar>
      <UserMenu
        anchorEl={userMenuAnchorEl}
        email={staff?.email || ""}
        phone={staff?.phone || ""}
        position={staff?.position?.name || ""}
        firstName={staff?.first_name || ""}
        lastName={staff?.last_name || ""}
        origin={{ vertical: "top", horizontal: "left" }}
        sx={{
          pointerEvents: "none",
          mt: "2em",
        }}
        onClose={() => setUserMenuAnchorEl(null)}
        onMouseEnter={() => setInUserMenu(true)}
        onMouseLeave={() => setInUserMenu(false)}
        id={String(staff.id)}
      />
    </>
  );
};

export default StaffAvatar;
