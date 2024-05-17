import React from "react";
import { GanttItem, GanttRow } from "./types";
import { GanttProvider } from "./GanttContext";
import Main from "./main";

export type TaskBarTooltipProps = {
  task: GanttItem;
  children: React.ReactElement;
};
type GanttProps = {
  rows: GanttRow[];
  enableLazyLoading?: false;
  totalRows?: undefined;
  onLazyLoad?: undefined;
  CustomTaskBarTooltip?: React.FC<TaskBarTooltipProps>;
};
type GanttLazyLoadedProps = {
  rows: GanttRow[];
  enableLazyLoading: true;
  totalRows: number;
  onLazyLoad: () => void;
  CustomTaskBarTooltip?: React.FC<TaskBarTooltipProps>;
};
export const Gantt = ({
  rows,
  enableLazyLoading,
  totalRows,
  onLazyLoad,
  CustomTaskBarTooltip,
}: GanttProps | GanttLazyLoadedProps) => {
  return (
    <GanttProvider
      rows={rows}
      enableLazyLoading={enableLazyLoading}
      totalRows={totalRows}
      onLazyLoad={onLazyLoad}
      CustomTaskBarTooltip={CustomTaskBarTooltip}
    >
      <Main />
    </GanttProvider>
  );
};
