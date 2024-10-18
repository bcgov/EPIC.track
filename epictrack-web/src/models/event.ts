import { EVENT_TYPE } from "../components/workPlan/phase/type";
import EventConfiguration from "./eventConfiguration";
import { Staff } from "./staff";
import { EVENT_STATUS } from "./taskEvent";
import { WorkPhase } from "./work";

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

export interface Assignee {
  id: number;
  is_active: boolean;
  task_event_id: number;
  assignee_id: number;
  assignee: Staff;
}
export interface MilestoneEventDateCheck {
  work_phase_to_be_exceeded: WorkPhase;
  event: MilestoneEvent;
  phase_end_push_required: boolean;
  subsequent_event_push_required: boolean;
  days_pushed: number;
}
export enum EventCategory {
  MILESTONE = 1,
  EXTENSION = 2,
  SUSPENSION = 3,
  DECISION = 4,
  PCP = 5,
  CALENDAR = 6,
  FINANCE = 7,
  SPECIAL_EXTENSION = 8,
}
export enum EventType {
  OPEN_HOUSE = 23,
  VIRTUAL_OPEN_HOUSE = 24,
  TIME_LIMIT_SUSPENSION = 12,
  TIME_LIMIT_RESUMPTION = 38,
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
