import { StalenessEnum } from "constants/application-constant";

export interface Status {
  id: number;
  description: string;
  posted_date: string;
  is_active: boolean;
  is_approved: boolean;
  approved_by?: string;
  approved_date: string;
  staleness?: StalenessEnum;
}

export interface StatusDashboardItem {
  project_is_active: boolean;
  project_name: string;
  work_id: number;
  work_is_active: boolean;
  work_name: string;
  status: Status | null;
  status_history: Status[];
  work_type: string;
}
