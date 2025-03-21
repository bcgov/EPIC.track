import { ListType } from "./code";
import { Staff } from "./staff";

export interface Ministry extends ListType {
  abbreviation: string;
  combined: string;
  minister: Staff;
  minister_id: number;
  sort_order: number;
  date_created: string;
  date_closed: string;
}
