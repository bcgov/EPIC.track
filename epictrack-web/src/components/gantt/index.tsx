import React, { useEffect, useRef } from "react";
import { Task, TaskParent } from "./types";
import { TimeScale } from "./TimeScale";
import TaskList from "./TaskList";
import TaskBarSection from "./TaskBarSection";
import {
  barHeight,
  dayWidth,
  rowHeight,
  sectionHeight,
  taskListWidth,
} from "./constants";
import moment from "moment";
import { Palette } from "styles/theme";
import { ScrollSync } from "react-scroll-sync";
import { getDefaultScrollDays } from "./utils";

type GanttProps = {
  parents: TaskParent[];
};

const DEFAULT_SCROLL_BACK_MONTHS = 3;

export const Gantt = ({ parents }: GanttProps) => {
  const tasks = parents.map((parent) => parent.tasks).flat();

  tasks.sort((a: Task, b: Task) => a.start.getTime() - b.start.getTime());

  const earliestStart = tasks.reduce(
    (prev: Date, task: Task) =>
      task.start.getTime() < prev.getTime() ? task.start : prev,
    tasks?.[0].start || new Date()
  );
  const latestEnd = tasks.reduce(
    (prev: Date, task: Task) =>
      task.end.getTime() > prev.getTime() ? task.end : prev,
    tasks?.[0].end || new Date()
  );

  const start = moment(earliestStart).startOf("month").toDate();
  const end = moment(latestEnd).endOf("month").toDate();

  const ganttChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ganttChartRef.current) {
      ganttChartRef.current.scrollLeft =
        getDefaultScrollDays(start, DEFAULT_SCROLL_BACK_MONTHS) * dayWidth;
    }
  }, [ganttChartRef]);

  return (
    <ScrollSync>
      <div
        ref={ganttChartRef}
        id="gantt-chart"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          height: sectionHeight + rowHeight * 2,
          overflow: "auto",
          backgroundColor: Palette.neutral.bg.light,
          boxShadow:
            "rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px",
        }}
      >
        <div
          style={{
            width: taskListWidth,
            position: "sticky",
            left: 0,
            zIndex: 5,
            // borderRight: `1px solid ${Palette.neutral.accent.dark}`,
            height: "100%",
          }}
        >
          <TaskList parents={parents} />
        </div>
        <div
          id="time-scale-section"
          style={{
            width: `calc(100% - ${taskListWidth}px)`,
            height: "100%",
            zIndex: 4,
            boxShadow: "1px 1px 4px 0px rgba(0, 0, 0, 0.10)",
          }}
        >
          <TimeScale start={start} end={end}>
            <TaskBarSection parents={parents} start={start} end={end} />
          </TimeScale>
        </div>
      </div>
    </ScrollSync>
  );
};
