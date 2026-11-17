import type { TaskEventItem } from "./taskEvent";

/** A task in a task template. */
export interface Task {
  id: number;
  name: string;
  start_at: number;
  number_of_days: number;
  template_id: number;
  tips: string;
  responsibility_id: number | null;
}

/** A task on My Tasks, with its work. */
export type MyTask = TaskEventItem & {
  work: { id: number; title: string; notes: string };
  end_date?: string;
};

export interface Responsibility {
  id: number;
  is_active: boolean;
  responsibility_id: number;
  task_event_id: number;
}
