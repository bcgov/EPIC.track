// TaskBarSection.js
import React from "react";
import TaskBar from "./TaskBar";
import { barHeight } from "./constants";
import { Palette } from "styles/theme";
import { useGanttContext } from "./GanttContext";

const TaskBarSection = () => {
  const { rows } = useGanttContext();
  return (
    <div
      style={{
        backgroundColor: Palette.neutral.bg.light,
      }}
    >
      {rows.map((row) => (
        <div
          key={`row-${row.id}`}
          style={{
            position: "relative",
            width: "100%",
            height: barHeight,
            zIndex: 1,
          }}
        >
          {row.tasks.map((task) => {
            return <TaskBar key={`task-${task.id}`} task={task} />;
          })}
        </div>
      ))}
    </div>
  );
};

export default TaskBarSection;
