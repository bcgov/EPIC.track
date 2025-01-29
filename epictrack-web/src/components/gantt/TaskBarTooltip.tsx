import { Tooltip } from "@mui/material";
import { TaskBarTooltipProps } from "components/gantt";

const TaskBarTooltip = ({ task, children }: TaskBarTooltipProps) => {
  return (
    <Tooltip
      followCursor
      title={
        <div>
          <p>{task.name}</p>
          <p>{task.progress}</p>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};

export default TaskBarTooltip;
