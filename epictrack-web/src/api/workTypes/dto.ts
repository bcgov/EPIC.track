/** WorkTypeResponseSchema and WorkTypeSchema. */
export interface TrackWorkTypeDto {
  id: number;
  name: string;
  sort_order: number;
  report_title: string | null;
  all_phases_require_overage_responsibility: boolean;
  default_report_description: string | null;
  report_sort_order: number | null;
  is_active: boolean;
}
