import { Avatar, AvatarGroup, Box, avatarGroupClasses } from "@mui/material";
import { CardProps } from "./type";
import RenderSurplus from "./RenderSurplus";
import { Staff } from "../../../models/staff";
import { Palette } from "../../../styles/theme";
import { ETCaption2 } from "../../shared";
import UserMenu from "../../shared/userMenu/UserMenu";
import { useAppSelector } from "../../../hooks";
import React, { useState, useEffect } from "react";

const StaffDisplay = ({ workplan }: CardProps) => {
  const [staffHover, setStaffHover] = React.useState<any>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [staffList, setStaffList] = useState<Array<any>>([]);
  const { email } = useAppSelector((state) => state.user.userDetail);

  const sortTeam = () => {
    let userIndex = -1;
    workplan.staff_info.map((staffObject: any, index: number) => {
      const staff = staffObject.staff;
      if (staff.email === email) {
        userIndex = index;
      }
    });
    if (userIndex >= 0) {
      [workplan.staff_info[0], workplan.staff_info[userIndex]] = [
        workplan.staff_info[userIndex],
        workplan.staff_info[0],
      ];
    }
    setStaffList(workplan.staff_info);
  };

  useEffect(() => {
    sortTeam();
  }, []);

  const handleCloseUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(null);
    setStaffHover(null);
  };

  const handleOpenUserMenu = (
    event: React.MouseEvent<HTMLElement>,
    staff: any
  ) => {
    setStaffHover(staff);
    setUserMenuAnchorEl(event.currentTarget);
  };

  return (
    <AvatarGroup
      max={4}
      renderSurplus={(surplus: number) => (
        <RenderSurplus
          renderSurplus={surplus}
          staff={workplan.staff_info as unknown as Staff[]}
        />
      )}
      sx={{
        [`& .${avatarGroupClasses.avatar}`]: {
          width: "24px",
          height: "24px",
          marginRight: -1,
        },
      }}
    >
      {staffList.map((staff: any) => {
        const isLoggedInUser = staff?.staff?.email === email;
        return (
          <Box>
            <Avatar
              key={staff.staff.id}
              sx={{
                bgcolor: isLoggedInUser
                  ? Palette.primary.main
                  : Palette.neutral.bg.main,
                color: isLoggedInUser ? Palette.white : Palette.neutral.dark,
                lineHeight: "12px",
                width: "24px",
                height: "24px",
              }}
              onMouseEnter={(event) => {
                event.stopPropagation();
                event.preventDefault();
                handleOpenUserMenu(event, staff.staff);
              }}
            >
              <ETCaption2
                bold
              >{`${staff.staff.first_name[0]}${staff.staff.last_name[0]}`}</ETCaption2>
            </Avatar>
            <UserMenu
              onMouseLeave={handleCloseUserMenu}
              anchorEl={userMenuAnchorEl}
              email={staffHover?.email || ""}
              phone={staffHover?.phone || ""}
              position={staffHover?.position?.name || ""}
              firstName={staffHover?.first_name || ""}
              lastName={staffHover?.last_name || ""}
              onClose={handleCloseUserMenu}
              origin={{ vertical: "top", horizontal: "left" }}
              sx={{
                pointerEvents: "none",
              }}
              id={staff.staff.id}
            />
          </Box>
        );
      })}
    </AvatarGroup>
  );
};

export default StaffDisplay;
