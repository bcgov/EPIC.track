export interface Status {
  id: number;
  description: string;
  posted_date: string;
  is_active: boolean;
  is_approved: boolean;
  approved_by?: string;
  notes?: string;
}
