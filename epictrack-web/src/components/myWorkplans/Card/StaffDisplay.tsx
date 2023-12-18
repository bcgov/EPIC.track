import { AvatarGroup, avatarGroupClasses } from "@mui/material";
import { CardProps } from "./type";
import RenderSurplus from "./Staff/RenderSurplus";
import { Staff } from "../../../models/staff";
import { useAppSelector } from "../../../hooks";
import React, { useState, useEffect } from "react";
import StaffAvatar from "./Staff/StaffAvatar";

const StaffDisplay = ({ workplan }: CardProps) => {
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
        },
      }}
    >
      {staffList.map((staff) => {
        return <StaffAvatar staff={staff.staff} />;
      })}
    </AvatarGroup>
  );
};

export default StaffDisplay;
