export type GanttItem = {
  id: string;
  name: string;
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
