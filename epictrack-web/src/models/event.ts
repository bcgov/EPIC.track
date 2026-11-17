import { EVENT_TYPE } from "../components/workPlan/phase/type";
import EventConfiguration from "./eventConfiguration";
import { Staff } from "./staff";
import { EVENT_STATUS } from "./taskEvent";
import type { TaskEventItem } from "./taskEvent";

export interface EventsGridModel {
  start_date: string;
  event_configuration_id: number;
  event_configuration: EventConfiguration;
  id: number;
  is_active: boolean;
  type: EVENT_TYPE;
  is_complete: boolean;
  long_description: string;
  name: string;
  number_of_days: number;
  end_date: string;
  outcome_id: string;
  short_description: string;
  assignees: Assignee[];
  responsibility: string;
  notes: string;
  status: EVENT_STATUS;
  visibility: EventTemplateVisibility;
  phase_name?: string;
}

export interface CalendarEvent {
  event: EventsGridModel;
  phase_name: string;
  phase_id: number;
  work_name: string;
  work_id: number;
}

export interface MilestoneEvent {
  name: string;
  event_configuration_id: number;
  event_configuration: EventConfiguration;
  anticipated_date: string;
  actual_date: string;
  id: number;
  notes: string;
  description: string;
  number_of_days: number;
  outcome_id?: number;
  high_priority: boolean;
  number_of_responses: number;
  number_of_attendees: number;
  topic: string;
  act_section_id: number;
  reason: string;
  decision_maker_id: number;
}

/** The fields a milestone save accepts. */
export interface MilestoneEventInput {
  name?: string;
  description?: string;
  anticipated_date?: string;
  actual_date?: string | null;
  number_of_days?: number;
  event_configuration_id?: number;
  outcome_id?: number;
  notes?: string;
  high_priority?: boolean;
  act_section_id?: number;
  reason?: string;
  decision_maker_id?: number;
  number_of_attendees?: number;
  number_of_responses?: number;
  start_at?: string;
  topic?: string;
}

/** A milestone on My Calendar, with its work and phase. */
export interface CalendarMilestone {
  event: MilestoneEvent;
  work_id: number;
  work_name: string;
  phase_id: number;
  phase_name: string;
}

/** My Calendar's event filters; api/events turns them into query params. */
export type CalendarEventFilter =
  | "milestone"
  | "task"
  | "decision"
  | "pcp"
  | "submission"
  | "start_end_milestone";

/** A task on My Calendar, with its work and phase. */
export interface CalendarTask {
  event: TaskEventItem;
  work_id: number;
  work_name: string;
  phase_id: number;
  phase_name: string;
}

export interface CalendarSearchOptions {
  event_types: CalendarEventFilter[];
  project_types: string[];
  regions: string[];
  staff_id: number | null;
  work_ids: number[];
  work_types: string[];
  year: number;
  teams: string[];
}

export interface Assignee {
  id: number;
  is_active: boolean;
  task_event_id: number;
  assignee_id: number;
  assignee: Staff;
}
export interface MilestoneEventDateCheck {
  phase_end_push_required: boolean;
  subsequent_event_push_required: boolean;
  days_pushed: number;
}

export enum EventPosition {
  START = "START",
  INTERMEDIATE = "INTERMEDIATE",
  END = "END",
}

export enum EventTemplateVisibility {
  MANDATORY = "MANDATORY",
  OPTIONAL = "OPTIONAL",
  HIDDEN = "HIDDEN",
  SUGGESTED = "SUGGESTED",
}
