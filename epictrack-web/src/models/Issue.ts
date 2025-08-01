import { StalenessEnum } from "constants/application-constant";

export interface WorkIssueUpdate {
  id: number;
  posted_date: string;
  description: string;
  work_issue_id: number;
  is_active: boolean;
  is_deleted: boolean;
  approved_by: string;
  is_approved: boolean;
  staleness?: StalenessEnum;
}

export interface WorkIssue {
  id: number;
  title: string;
  start_date: string;
  expected_resolution_date: string;
  is_active: boolean;
  is_high_priority: boolean;
  is_resolved: boolean;
  work_id: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  updates: WorkIssueUpdate[];
}

export interface WorkIssueDashboardItem {
  work_id: number;
  work_name: string;
  issue: WorkIssue;
  work_type: string;
}

export const defaultWorkIssue = {
  id: 0,
  title: "",
  description: "",
  start_date: "",
  expected_resolution_date: "",
  active: false,
  high_priority: false,
  is_resolved: false,
  updates: [],
};

export const defaultWorkIssueUpdated = {
  id: 0,
  description: "",
  work_issue_id: 0,
  is_active: false,
  is_deleted: false,
};
