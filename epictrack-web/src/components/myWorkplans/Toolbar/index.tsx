import React, { useContext } from "react";
import { IconButton, Stack } from "@mui/material";
import { AssigneeToggle } from "../Filters/AssigneeToggle";
import icons from "components/icons";
import { MyWorkplansContext } from "../MyWorkPlanContext";
import { MY_WORKPLAN_VIEW } from "../type";
import { ViewIcon } from "./ViewIcon";

const AppsIcon = icons["Apps"];
const GanttIcon = icons["Gantt"];

export const Toolbar = () => {
  const { myWorkPlanView, setMyWorkPlanView } = useContext(MyWorkplansContext);
  return (
    <Stack direction={"row"} spacing={1}>
      <AssigneeToggle />
      <IconButton
        onClick={() => setMyWorkPlanView(MY_WORKPLAN_VIEW.CARDS)}
        disableRipple
      >
        <ViewIcon
          active={myWorkPlanView === MY_WORKPLAN_VIEW.CARDS}
          icon={AppsIcon}
        />
      </IconButton>
      <IconButton
        onClick={() => setMyWorkPlanView(MY_WORKPLAN_VIEW.GANTT)}
        disableRipple
      >
        <ViewIcon
          active={myWorkPlanView === MY_WORKPLAN_VIEW.GANTT}
          icon={GanttIcon}
        />
      </IconButton>
    </Stack>
  );
};
