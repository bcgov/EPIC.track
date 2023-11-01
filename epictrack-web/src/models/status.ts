export interface Status {
  id: number;
  title: string;
  description: string;
  active: boolean;
  high_priority: boolean;
  start_date: number;
  expected_resolution_date: number;
}
