// TaskBarSection.js
import React from "react";
import TaskBar from "./TaskBar";
import { TaskParent } from "./types";
import { barHeight, rowHeight, sectionHeight } from "./constants";
import { Palette } from "styles/theme";
import { ScrollSyncPane } from "react-scroll-sync";

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
        height: sectionHeight,
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
                color={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TaskBarSection;
