import React from "react";
import { Task, TaskParent } from "./types";
import { TimeScale } from "./TimeScale";
import TaskList from "./TaskList";
import TaskBarSection from "./TaskBarSection";

type GanttProps = {
  parents: TaskParent[];
};

export const Gantt = ({ parents }: GanttProps) => {
  const tasks = parents.map((parent) => parent.tasks).flat();

  tasks.sort((a: Task, b: Task) => a.start.getTime() - b.start.getTime());

  const start = tasks[0]?.start;
  const end = tasks[tasks.length - 1]?.end;

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "calc(100% - 200px)" }}>
        <TimeScale start={start} end={end}>
          <TaskBarSection parents={parents} start={start} end={end} />
        </TimeScale>
      </div>
    </div>
  );
};
