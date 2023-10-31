export interface Status {
  id: number;
  title: string;
  description: string;
  active: boolean;
  high_priority: boolean;
  start_date: string;
  expected_resolution_date: number;
}
