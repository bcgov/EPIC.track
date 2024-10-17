export interface CreateIssueForm {
  title: string;
  description: string;
  description_id?: number | null;
  start_date: string;
  expected_resolution_date?: string;
  is_active: boolean;
  is_high_priority: boolean;
}

export interface EditIssueForm {
  title: string;
  start_date: string;
  expected_resolution_date?: string;
  is_active: boolean;
  is_high_priority: boolean;
}

export interface EditIssueUpdateForm {
  description: string;
}

export interface CloneForm {
  posted_date: string;
  description: string;
}
