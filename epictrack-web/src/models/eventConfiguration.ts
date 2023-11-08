import { EventPosition } from "./event";

export default interface EventConfiguration {
  id: number;
  name: string;
  event_category_id: number;
  event_type_id: number;
  multiple_days: boolean;
  event_position: EventPosition;
  mandatory: boolean;
  work_phase_id: number;
}
