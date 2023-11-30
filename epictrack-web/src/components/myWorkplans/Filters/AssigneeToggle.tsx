import React from "react";
import { FormControlLabel, Stack, Switch } from "@mui/material";
import { useAppSelector } from "../../../hooks";
import { ETCaption2 } from "../../shared";
import { Palette } from "../../../styles/theme";
import { CustomSwitch } from "../../shared/CustomSwitch";

export const AssigneeToggle = () => {
  const user = useAppSelector((state) => state.user.userDetail);

  const [isUsersWorkPlans, setIsUsersWorkPlans] = React.useState(false);
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
        onChange={() => setIsUsersWorkPlans(!isUsersWorkPlans)}
      />
    </Stack>
  );
};
