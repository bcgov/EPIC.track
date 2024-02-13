import React from "react";
import { Task } from "./types";
import { TimeScale } from "./TimeScale";
import TaskList from "./TaskList";
import TaskBarSection from "./TaskBarSection";

type GanttProps = {
  tasks: Task[];
};

export const Gantt = ({ tasks }: GanttProps) => {
  const sortedTasks = tasks.sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
  const start = sortedTasks[0]?.start;
  const end = sortedTasks[sortedTasks.length - 1]?.end;

  return (
    <div style={{ display: "flex" }}>
      <div style={{ overflow: "scroll" }}>
        <TimeScale start={start} end={end} />
      </div>
      {/* <TaskBarSection tasks={tasks} /> */}
    </div>
  );
};
