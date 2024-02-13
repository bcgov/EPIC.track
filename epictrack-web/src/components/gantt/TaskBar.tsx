// TaskBar.js
import React from "react";

type TaskBar = {
  task: any;
};

const TaskBar = ({ task }: TaskBar) => {
  const { start, end } = task;
  // Calculate the total duration of the Gantt chart in milliseconds
  const totalDuration = end - start;

  // Calculate the start position and duration of the task in milliseconds
  const taskStart = task.start - start;
  const taskDuration = task.end - task.start;

  // Calculate the relative start position and width of the task as a percentage
  const left = (taskStart / totalDuration) * 100;
  const width = (taskDuration / totalDuration) * 100;

  return (
    <div style={{ left: `${left}%`, width: `${width}%` }}>{task.name}</div>
  );
};

export default TaskBar;
