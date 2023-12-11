import React, { useContext, useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { useAppSelector } from "../../../hooks";
import { ETCaption2 } from "../../shared";
import { Palette } from "../../../styles/theme";
import { CustomSwitch } from "../../shared/CustomSwitch";
import staffService from "../../../services/staffService/staffService";
import { MyWorkplansContext } from "../MyWorkPlanContext";

export const AssigneeToggle = () => {
  const user = useAppSelector((state) => state.user.userDetail);
  const { setSearchOptions } = useContext(MyWorkplansContext);

  const [isUsersWorkPlans, setIsUsersWorkPlans] = useState(false);
  const [staffId, setStaffId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const getStaffInfo = async () => {
    if (!user.email) return;

    try {
      const response = await staffService.getByEmail(user.email);
      setStaffId(response.data.id);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getStaffInfo();
  }, [isUsersWorkPlans]);

  const handleToggleChange = (checked: boolean) => {
    setIsUsersWorkPlans(checked);
    setSearchOptions((prev) => ({
      ...prev,
      staff_id: checked ? staffId : null,
    }));
  };

  return (
    <Stack direction="row" spacing={1} alignItems={"center"}>
      <>
        <ETCaption2 bold color={Palette.neutral.dark}>
          {user.firstName}'s{" "}
        </ETCaption2>
        <ETCaption2 color={Palette.neutral.dark}>Workplans</ETCaption2>
      </>
      <CustomSwitch
        color="primary"
        checked={isUsersWorkPlans}
        onChange={() => handleToggleChange(!isUsersWorkPlans)}
        disabled={loading}
      />
    </Stack>
  );
};
