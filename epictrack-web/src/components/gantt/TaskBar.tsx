// TaskBar.js
import moment from "moment";
import { dayWidth } from "./constants";
import { GanttItem } from "./types";
import { ETCaption3 } from "components/shared";
import { Tooltip } from "@mui/material";

type TaskBar = {
  task: GanttItem;
  start: Date;
  end: Date;
};

const TaskBar = ({ task, start }: TaskBar) => {
  // Calculate the total duration of the Gantt chart in milliseconds
  const momentStart = moment(start);
  const momentTaskStart = moment(task.start);
  const daysDiff = momentTaskStart.diff(momentStart, "days");

  const taskSpan = moment(task.end).diff(moment(task.start), "days") + 1;
  return (
    <div
      style={{
        left: `${daysDiff * dayWidth}px`,
        height: "100%",
        position: "absolute",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Tooltip
        title={
          <div>
            <p>{task.name}</p>
            <p>{task.progress}</p>
          </div>
        }
        followCursor
      >
        <div
          id="task-bar"
          style={{
            width: `${taskSpan * dayWidth}px`,
            backgroundColor: `${task.style.bar.backgroundColor}`,
            borderBottom: `2px solid`,
            height: "70%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: "8px",
            paddingRight: "8px",
            gap: 2,
            overflow: "hidden",
            borderRadius: "4px",
          }}
        >
          <ETCaption3
            sx={{
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {task.name}
          </ETCaption3>
          <ETCaption3
            sx={{
              ...(task.style.progress || {}),
            }}
            bold
          >
            {task.progress}
          </ETCaption3>
        </div>
      </Tooltip>
    </div>
  );
};

export default TaskBar;
