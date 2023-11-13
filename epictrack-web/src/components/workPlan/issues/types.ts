export interface IssueForm {
  title: string;
  description: string;
  description_id?: number | null;
  start_date: string;
  expected_resolution_date?: string;
  is_active: boolean;
  is_high_priority: boolean;
}

export interface CloneForm {
  description: string;
}
