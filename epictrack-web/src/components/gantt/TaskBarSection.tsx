// TaskBarSection.js
import React from "react";
import TaskBar from "./TaskBar";
import { GanttRow } from "./types";
import { barHeight } from "./constants";
import { Palette } from "styles/theme";

type TaskBarSectionProps = {
  rows: GanttRow[];
  start: Date;
  end: Date;
};

const TaskBarSection = ({ rows, start, end }: TaskBarSectionProps) => {
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
            return (
              <TaskBar
                key={`task-${task.id}`}
                task={task}
                start={start}
                end={end}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TaskBarSection;
