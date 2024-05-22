export type GanttItem = {
  id: string;
  name: string;
  rowName?: string;
  currentMilestone: string;
  nextMilestone: string;
  is_completed: boolean;
  is_current: boolean;
  start: Date;
  end: Date;
  progress: string;
  style: {
    bar: React.CSSProperties;
    progress: React.CSSProperties;
  };
};

export type GanttRow = {
  id: string;
  name: string;
  onClick?: () => void;
  tasks: GanttItem[];
};
