// export interface CalendarStyleProps {
//   gridSize: string;
// }

export interface CalendarEvent {
  start_date: Date;
  end_date: Date;
  name: string;
  link: string;
  project: string;
  project_description: string;
  project_address: string;
  project_short_code: string;
  phase: string;
  color: string;
  work_type: string;
  id: number;
}
