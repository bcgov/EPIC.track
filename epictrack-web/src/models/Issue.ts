export interface WorkIssueUpdate {
  id: number;
  description: string;
  work_issue_id: number;
  is_active: boolean;
  is_deleted: boolean;
}

export interface WorkIssue {
  id: number;
  title: string;
  start_date: string;
  expected_resolution_date: string;
  is_active: boolean;
  is_high_priority: boolean;
  work_id: number;
  is_deleted: boolean;
  approved_by: string;
  is_approved: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  updates: WorkIssueUpdate[];
}

export const defaultWorkIssue = {
  id: 0,
  title: "",
  description: "",
  start_date: "",
  expected_resolution_date: "",
  active: false,
  high_priority: false,
  updates: [],
};

export const defaultWorkIssueUpdated = {
  id: 0,
  description: "",
  work_issue_id: 0,
  is_active: false,
  is_deleted: false,
};
