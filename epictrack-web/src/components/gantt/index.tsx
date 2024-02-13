import React from "react";
import { Task, TaskParent } from "./types";
import { TimeScale } from "./TimeScale";
import TaskList from "./TaskList";
import TaskBarSection from "./TaskBarSection";
import { barHeight, rowHeight } from "./constants";

type GanttProps = {
  parents: TaskParent[];
};

export const Gantt = ({ parents }: GanttProps) => {
  const tasks = parents.map((parent) => parent.tasks).flat();

  tasks.sort((a: Task, b: Task) => a.start.getTime() - b.start.getTime());

  const start = tasks[0]?.start;
  const end = tasks[tasks.length - 1]?.end;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        height: parents.length * barHeight + 2 * rowHeight,
      }}
    >
      <div style={{ width: "200px", height: "100%" }}>
        <TaskList parents={parents} />
      </div>
      <div style={{ width: "calc(100% - 200px)", height: "100%" }}>
        <TimeScale start={start} end={end}>
          <TaskBarSection parents={parents} start={start} end={end} />
        </TimeScale>
      </div>
    </div>
  );
};
