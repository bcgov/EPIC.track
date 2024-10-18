import { ListType } from "./code";
import { Role } from "./role";
import { MasterBase } from "./type";

export interface Staff extends MasterBase {
  id: number;
  idir_user_id: string;
  phone: string;
  email: string;
  is_active: boolean;
  position_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  position: ListType & { sort_order: number };
}

export interface StaffRole extends Staff {
  role: Role;
}

export interface StaffWorkRole {
  id: number;
  staff_id: number;
  staff: Staff;
  role_id: number;
  role: Role;
  work_id: number;
  is_active: boolean;
  status: string;
}

export const defaultStaff = {
  is_active: true,
};
