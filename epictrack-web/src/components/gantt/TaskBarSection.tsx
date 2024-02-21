// TaskBarSection.js
import React from "react";
import TaskBar from "./TaskBar";
import { TaskParent } from "./types";
import { barHeight } from "./constants";
import { Palette } from "styles/theme";

type TaskBarSectionProps = {
  parents: TaskParent[];
  start: Date;
  end: Date;
};

const TaskBarSection = ({ parents, start, end }: TaskBarSectionProps) => {
  return (
    <div
      style={{
        backgroundColor: Palette.neutral.bg.light,
      }}
    >
      {parents.map((parent) => (
        <div
          key={`parent-${parent.id}`}
          style={{
            position: "relative",
            width: "100%",
            height: barHeight,
            zIndex: 1,
          }}
        >
          {parent.tasks.map((task) => {
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
