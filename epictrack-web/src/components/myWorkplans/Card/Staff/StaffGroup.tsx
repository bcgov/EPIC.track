import React, { useEffect } from "react";
import { AvatarGroup, avatarGroupClasses } from "@mui/material";
import { CardProps } from "../type";
import { useState } from "react";
import { useAppSelector } from "../../../../hooks";
import RenderSurplus from "./RenderSurplus";
import { Staff } from "../../../../models/staff";
import StaffAvatar from "./StaffAvatar";
import { sortTeam } from "./utils";
import { AVATAR_HEIGHT, AVATAR_WIDTH } from "./constants";

const StaffGroup = ({ workplan }: CardProps) => {
  React.useState<null | HTMLElement>(null);
  const [staffList, setStaffList] = useState<Array<any>>([]);
  const { email } = useAppSelector((state) => state.user.userDetail);
  const { staff_info } = workplan;

  useEffect(() => {
    const sortedList = sortTeam(staff_info, email);
    setStaffList(sortedList);
  }, [staff_info]);

  return (
    <AvatarGroup
      max={3}
      renderSurplus={(surplus: number) => (
        <RenderSurplus
          renderSurplus={surplus}
          staff={staff_info as unknown as Staff[]}
        />
      )}
      sx={{
        [`& .${avatarGroupClasses.avatar}`]: {
          width: AVATAR_WIDTH,
          height: AVATAR_HEIGHT,
        },
        justifyContent: "flex-end",
      }}
    >
      {staffList.map((staff) => {
        return <StaffAvatar key={staff.staff.id} staff={staff.staff} />;
      })}
    </AvatarGroup>
  );
};

export default StaffGroup;
