import { Staff } from "models/staff";

/** TaskEventAssigneeResponseSchema. */
export interface TrackTaskAssigneeDto {
  id: number;
  task_event_id: number;
  assignee_id: number;
  is_active: boolean;
  assignee: Staff;
}

/** TaskEventResponsibilityResponseSchema. */
export interface TrackTaskResponsibilityDto {
  id: number;
  task_event_id: number;
  responsibility_id: number;
  is_active: boolean;
}

/** TaskEventResponseSchema. */
export interface TrackTaskEventDto {
  id: number;
  name: string;
  work_phase_id: number;
  start_date: string;
  number_of_days: number;
  tips: string;
  notes: string;
  status: string;
  is_active: boolean;
  /** Assignee names, comma-separated. */
  assigned: string;
  /** Responsibility names, comma-separated. */
  responsibility: string;
  assignees: TrackTaskAssigneeDto[];
  responsibilities: TrackTaskResponsibilityDto[];
}

/** TaskEventByStaffResponseSchema. */
export interface TrackMyTaskDto extends TrackTaskEventDto {
  work: { id: number; title: string; notes: string };
}

/** A tasks/calendar item, built by TaskService._serialize_task. */
export interface TrackCalendarTaskDto {
  work_name: string;
  work_id: number;
  phase_name: string;
  phase_id: number;
  event: TrackTaskEventDto;
}

/** TaskEventBodyParamSchema. */
export type TrackTaskWriteDto = Partial<Record<string, unknown>>;
