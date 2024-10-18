import React, { useContext, useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { useAppSelector } from "../../../hooks";
import { ETCaption2 } from "../../shared";
import { Palette } from "../../../styles/theme";
import { CustomSwitch } from "../../shared/CustomSwitch";
import { MyWorkplansContext } from "../MyWorkPlanContext";

export const AssigneeToggle = () => {
  const user = useAppSelector((state) => state.user.userDetail);
  const { searchOptions, setSearchOptions, loadingWorkplans, totalWorkplans } =
    useContext(MyWorkplansContext);
  const [haveInitializedtoggle, setHaveInitializedToggle] = useState(false);

  const [isUsersWorkPlans, setIsUsersWorkPlans] = useState(
    Boolean(searchOptions.staff_id)
  );

  const handleToggleChange = (checked: boolean) => {
    setIsUsersWorkPlans(checked);
    setSearchOptions((prev) => ({
      ...prev,
      staff_id: checked ? user.staffId : null,
    }));
  };

  useEffect(() => {
    if (!haveInitializedtoggle && !loadingWorkplans) {
      setHaveInitializedToggle(true);
      if (totalWorkplans === 0) {
        handleToggleChange(false);
      }
    }
  }, [loadingWorkplans]);

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
      />
    </Stack>
  );
};
