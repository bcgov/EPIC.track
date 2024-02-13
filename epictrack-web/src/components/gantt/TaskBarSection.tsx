// TaskBarSection.js
import React from "react";
import TaskBar from "./TaskBar";
import { TaskParent } from "./types";
import moment from "moment";

type TaskBarSectionProps = {
  parents: TaskParent[];
  start: Date;
  end: Date;
};

const TaskBarSection = ({ parents, start, end }: TaskBarSectionProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "200px" }}>
      {parents.map((parent) => (
        <div
          key={`parent-${parent.id}`}
          style={{
            display: "flex",
            flexDirection: "row",
            position: "relative",
            width: "100%",
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
