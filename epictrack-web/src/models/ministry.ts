import { ListType } from "./code";
import { Staff } from "./staff";

export interface Ministry extends ListType {
  abbreviation: string;
  combined: string;
  minister: Staff;
  sort_order: number;
}
