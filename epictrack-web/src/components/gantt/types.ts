export type GanttItem = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  style: {
    bar: React.CSSProperties;
    progress: React.CSSProperties;
  };
};

export type GanttRow = {
  id: string;
  name: string;
  tasks: GanttItem[];
};
