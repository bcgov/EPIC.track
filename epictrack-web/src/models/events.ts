import { EVENT_TYPE } from "../components/workPlan/phase/type";
import { Staff } from "./staff";
import { EVENT_STATUS } from "./task_event";

export interface EventsGridModel {
  start_date: string;
  event_configuration_id: number;
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
  mandatory: boolean;
}

export interface MilestoneEvent {
  name: string;
  event_configuration_id: number;
  anticipated_date: string;
  actual_date: string;
  id: number;
  notes: string;
  description: string;
  number_of_days: number;
  outcome_id?: number;
}

export interface Assignee {
  id: number;
  is_active: boolean;
  task_event_id: number;
  assignee_id: number;
  assignee: Staff;
}
