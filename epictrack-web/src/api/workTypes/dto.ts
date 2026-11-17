/** WorkTypeResponseSchema and WorkTypeSchema. */
export interface TrackWorkTypeDto {
  id: number;
  name: string;
  sort_order: number;
  report_title: string | null;
  is_active: boolean;
}
