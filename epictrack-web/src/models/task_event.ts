export enum EVENT_STATUS {
  NOT_STARTED = "NOT_STARTED",
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
}
export interface TaskEvent {
  id: number;
  name: string;
  work_id: number;
  phase_id: number;
  responsibility_id: number;
  anticipated_date: string;
  actual_date: string;
  number_of_days: number;
  tips: string;
  notes: string;
  assignee_ids: number[];
  status: EVENT_STATUS;
}
