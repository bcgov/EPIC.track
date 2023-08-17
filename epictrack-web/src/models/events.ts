import { EVENT_TYPE } from "../components/workPlan/phase/type";
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
  assigned: string;
  responsibility: string;
  notes: string;
  status: EVENT_STATUS;
}
