// TaskBar.js
import moment from "moment";
import React from "react";
import { barHeight, dayWidth } from "./constants";
import { Task } from "./types";
import { Palette } from "styles/theme";
import { ETCaption3 } from "components/shared";
import { over } from "lodash";
import { Tooltip } from "@mui/material";

type TaskBar = {
  task: Task;
  start: Date;
  end: Date;
  color: string;
};

const TaskBar = ({ task, start, color }: TaskBar) => {
  // Calculate the total duration of the Gantt chart in milliseconds
  const momentStart = moment(start);
  const momentTaskStart = moment(task.start);
  const daysDiff = momentTaskStart.diff(momentStart, "days");

  const taskSpan = moment(task.end).diff(moment(task.start), "days");
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
          style={{
            width: `${taskSpan * dayWidth}px`,
            backgroundColor: "#EDEAF2",
            borderBottom: `2px solid #8775A9`,
            height: "70%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: "8px",
            paddingRight: "8px",
            gap: 2,
            overflow: "hidden",
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
              ...(task.progressProps || {}),
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
