// TaskBarSection.js
import React from "react";
import TaskBar from "./TaskBar";
import { TaskParent } from "./types";
import { barHeight, rowHeight } from "./constants";

type TaskBarSectionProps = {
  parents: TaskParent[];
  start: Date;
  end: Date;
};

const TaskBarSection = ({ parents, start, end }: TaskBarSectionProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {parents.map((parent) => (
        <div
          key={`parent-${parent.id}`}
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            width: "100%",
            height: barHeight,
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
