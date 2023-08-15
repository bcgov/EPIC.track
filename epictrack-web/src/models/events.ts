import { EVENT_TYPE } from "../components/workPlan/phase/type";

export interface EventsGridModel {
  actual_date: string;
  anticipated_date: string;
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
  progress: string;
}
