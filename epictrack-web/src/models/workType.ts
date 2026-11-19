export interface WorkType {
  id: number;
  is_active: boolean;
  name: string;
  sort_order: number;
  /** The report description a new work of this type starts with. */
  default_report_description: string | null;
}
