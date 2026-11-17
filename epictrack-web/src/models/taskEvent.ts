import type { Assignee } from "./event";
import type { Responsibility } from "./task";

export enum EVENT_STATUS {
  NOT_STARTED = "NOT_STARTED",
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
}
export const statusOptions = [
  {
    label: "Not Started",
    value: EVENT_STATUS.NOT_STARTED,
  },
  {
    label: "In Progress",
    value: EVENT_STATUS.INPROGRESS,
  },
  {
    label: "Complete",
    value: EVENT_STATUS.COMPLETED,
  },
];
export interface TaskEvent {
  id: number;
  name: string;
  work_phase_id: number;
  start_date: string;
  number_of_days: number;
  tips: string;
  notes: string;
  assignee_ids?: string[];
  responsibility_ids?: string[];
  status: EVENT_STATUS;
}

/** A task as the work plan, My Tasks and My Calendar list it. */
export interface TaskEventItem {
  id: number;
  name: string;
  work_phase_id: number;
  start_date: string;
  number_of_days: number;
  tips: string;
  notes: string;
  status: EVENT_STATUS;
  /** Assignee names, comma-separated. */
  assigned: string;
  /** Responsibility names, comma-separated. */
  responsibility: string;
  assignees: Assignee[];
  responsibilities: Responsibility[];
}

/** The fields a task save accepts. */
export interface TaskEventInput {
  name?: string;
  work_phase_id?: number;
  responsibility_ids?: string[];
  start_date?: string;
  number_of_days?: number;
  tips?: string;
  notes?: string;
  assignee_ids?: string[];
  status?: string;
}

/** Sets one field on several tasks. */
export interface TaskBulkUpdateInput {
  task_ids: string[];
  assignee_ids?: string[];
  responsibility_ids?: string[];
  status?: string;
  work_id?: number;
}
