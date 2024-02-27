import React from "react";
import { GanttRow } from "./types";
import { GanttProvider } from "./GanttContext";
import Toolbar from "./ControlBar";
import { Chart } from "./Chart";
import Main from "./main";

type GanttProps = {
  rows: GanttRow[];
  enableLazyLoading?: false;
  totalRows?: undefined;
  onLazyLoad?: undefined;
};
type GanttLazyLoadedProps = {
  rows: GanttRow[];
  enableLazyLoading: true;
  totalRows: number;
  onLazyLoad: () => void;
};
export const Gantt = ({
  rows,
  enableLazyLoading,
  totalRows,
  onLazyLoad,
}: GanttProps | GanttLazyLoadedProps) => {
  return (
    <GanttProvider
      rows={rows}
      enableLazyLoading={enableLazyLoading}
      totalRows={totalRows}
      onLazyLoad={onLazyLoad}
    >
      <Main />
    </GanttProvider>
  );
};
