import { StaffRole } from "./staff";
import { Work } from "./work";
export interface WorkStaff extends Work {
  staff: StaffRole[];
}
