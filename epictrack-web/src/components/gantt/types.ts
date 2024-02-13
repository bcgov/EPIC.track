export type Task = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
};

export type TaskParent = {
  id: string;
  name: string;
  tasks: Task[];
};
