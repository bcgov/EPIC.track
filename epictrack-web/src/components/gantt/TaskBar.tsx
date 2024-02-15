// TaskBar.js
import moment from "moment";
import React from "react";
import { barHeight, dayWidth } from "./constants";
import { Task } from "./types";

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
      <div
        style={{
          width: `${taskSpan * dayWidth}px`,
          backgroundColor: color ?? "black",
          height: "50%",
        }}
      />
    </div>
  );
};

export default TaskBar;
