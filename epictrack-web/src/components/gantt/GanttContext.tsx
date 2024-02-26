import React, { createContext, useMemo, useRef } from "react";
import { GanttItem, GanttRow } from "./types";
import moment from "moment";
import { barHeight, maxSectionHeight } from "./constants";

interface GanttContextProps {
  start: Date;
  end: Date;
  rows: GanttRow[];
  sectionHeight: number;
  enableLazyLoading?: boolean;
  isLoadingMore?: boolean;
  totalRows?: number;
  onLazyLoad?: () => void;
  scrollingToToday: boolean;
  setScrollingToToday: (value: boolean) => void;
  ganttChartRef?: React.RefObject<HTMLDivElement> | null;
}

export const GanttContext = createContext<GanttContextProps>({
  start: new Date(),
  end: new Date(),
  rows: [],
  sectionHeight: maxSectionHeight,
  enableLazyLoading: false,
  totalRows: 0,
  onLazyLoad: () => {
    return;
  },
  isLoadingMore: false,
  scrollingToToday: false,
  setScrollingToToday: (_value: boolean) => {
    return;
  },
  ganttChartRef: null,
});

type GanttProviderProps = {
  rows: GanttRow[];
  children: JSX.Element | JSX.Element[];
  enableLazyLoading?: boolean;
  totalRows?: number;
  onLazyLoad?: () => void;
  isLoadingMore?: boolean;
};
export const GanttProvider = ({
  rows,
  children,
  enableLazyLoading,
  totalRows,
  onLazyLoad,
  isLoadingMore,
}: GanttProviderProps) => {
  const tasks = useMemo(() => rows.map((row) => row.tasks).flat(), [rows]);
  const ganttChartRef = useRef<HTMLDivElement>(null);

  const [scrollingToToday, setScrollingToToday] = React.useState(false);

  const start = useMemo(() => {
    const earliestStart = tasks.reduce(
      (prev: Date, task: GanttItem) =>
        task.start.getTime() < prev.getTime() ? task.start : prev,
      tasks?.[0].start || new Date()
    );
    return moment(earliestStart).startOf("month").toDate();
  }, [tasks]);

  const end = useMemo(() => {
    const latestEnd = tasks.reduce(
      (prev: Date, task: GanttItem) =>
        task.end.getTime() > prev.getTime() ? task.end : prev,
      tasks?.[0].end || new Date()
    );
    return moment(latestEnd).endOf("month").toDate();
  }, [tasks]);

  const sectionHeight = useMemo(() => {
    return Math.min(maxSectionHeight, rows.length * barHeight);
  }, [rows]);

  const contextValue = useMemo(
    () => ({
      start,
      end,
      rows,
      sectionHeight,
      enableLazyLoading,
      totalRows,
      onLazyLoad,
      isLoadingMore,
      scrollingToToday,
      setScrollingToToday,
      ganttChartRef,
    }),
    [
      start,
      end,
      rows,
      sectionHeight,
      enableLazyLoading,
      totalRows,
      onLazyLoad,
      isLoadingMore,
      scrollingToToday,
      setScrollingToToday,
      ganttChartRef,
    ]
  );
  return (
    <GanttContext.Provider value={contextValue}>
      {children}
    </GanttContext.Provider>
  );
};

export const useGanttContext = () => {
  return React.useContext(GanttContext);
};
