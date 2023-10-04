export default interface EventConfiguration {
  id: number;
  name: string;
  event_category_id: number;
  multiple_days: boolean;
  mandatory: boolean;
  work_phase_id: number;
}
