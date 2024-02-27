import React, { useEffect, useRef } from "react";
import { TimeScale } from "./TimeScale";
import TaskList from "./TaskList";
import TaskBarSection from "./TaskBarSection";
import {
  barHeight,
  dayWidth,
  rowHeight,
  maxSectionHeight,
  taskListWidth,
} from "./constants";
import { Palette } from "styles/theme";
import { ScrollSync } from "react-scroll-sync";
import { getDefaultScrollDays } from "./utils";
import { useGanttContext } from "./GanttContext";

const DEFAULT_SCROLL_BACK_MONTHS = 3;

export const Main = () => {
  const { rows, start } = useGanttContext();

  const ganttChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ganttChartRef.current) {
      ganttChartRef.current.scrollLeft =
        getDefaultScrollDays(start, DEFAULT_SCROLL_BACK_MONTHS) * dayWidth;
    }
  }, [ganttChartRef, start]);

  const sectionHeight = Math.min(maxSectionHeight, rows.length * barHeight);
  return (
    <ScrollSync>
      <div
        ref={ganttChartRef}
        id="gantt-chart"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          height: `${sectionHeight + rowHeight * 2}px`,
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
            zIndex: 2,
            height: "100%",
          }}
        >
          <TaskList />
        </div>
        <div
          id="time-scale-section"
          style={{
            width: `calc(100% - ${taskListWidth}px)`,
            height: "100%",
            zIndex: 1,
            boxShadow: "1px 1px 4px 0px rgba(0, 0, 0, 0.10)",
          }}
        >
          <TimeScale>
            <TaskBarSection />
          </TimeScale>
        </div>
      </div>
    </ScrollSync>
  );
};
