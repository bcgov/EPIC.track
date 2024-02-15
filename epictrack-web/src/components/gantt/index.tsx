import React from "react";
import { Task, TaskParent } from "./types";
import { TimeScale } from "./TimeScale";
import TaskList from "./TaskList";
import TaskBarSection from "./TaskBarSection";
import { barHeight, rowHeight } from "./constants";
import moment from "moment";
import { Palette } from "styles/theme";

type GanttProps = {
  parents: TaskParent[];
};

const TASK_LIST_WIDTH = 300;

export const Gantt = ({ parents }: GanttProps) => {
  const tasks = parents.map((parent) => parent.tasks).flat();

  tasks.sort((a: Task, b: Task) => a.start.getTime() - b.start.getTime());

  const earliestStart = tasks.reduce(
    (prev: Date, task: Task) =>
      task.start.getTime() < prev.getTime() ? task.start : prev,
    tasks[0].start,
  );
  const latestEnd = tasks.reduce(
    (prev: Date, task: Task) =>
      task.end.getTime() > prev.getTime() ? task.end : prev,
    tasks[0].end,
  );

  const start = moment(earliestStart).startOf("month").toDate();
  const end = moment(latestEnd).endOf("month").toDate();

  return (
    <div
      id="gantt-chart"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        height: parents.length * barHeight + rowHeight * 2,
        overflowY: "scroll",
      }}
    >
      <div
        style={{
          width: TASK_LIST_WIDTH,
          height: "100%"
        }}
      >
        <TaskList parents={parents} />
      </div>
      <div
        id="time-scale-section"
        style={{
          width: `calc(100% - ${TASK_LIST_WIDTH}px)`,
          height: "100%"
        }}
      >
        <TimeScale start={start} end={end}>
          <TaskBarSection parents={parents} start={start} end={end} />
        </TimeScale>
      </div>
    </div>
  );
};
