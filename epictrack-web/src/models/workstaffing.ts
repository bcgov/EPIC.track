import { Staff } from "./staff";
export interface WorkStaffingModel {
    project_name: string;
    Worktitle:string;
    WorkStaffRole:string;
    team:string;
    lead:string;
    responsible_epd: string;
    staff:Staff[];
}