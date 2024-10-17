export interface Role {
  id: number;
  name: string;
}

//Typing matches role.py model
export enum WorkStaffRole {
  RESPONSIBLE_EPD = 1,
  TEAM_LEAD = 2,
  OFFICER_ANALYST = 3,
  FN_CAIRT = 4,
  OTHER = 5,
  TEAM_CO_LEAD = 6,
}

export const WorkStaffRoleNames: Record<WorkStaffRole, string> = {
  [WorkStaffRole.RESPONSIBLE_EPD]: "Responsible EPD",
  [WorkStaffRole.TEAM_LEAD]: "Team Lead",
  [WorkStaffRole.OFFICER_ANALYST]: "Officer Analyst",
  [WorkStaffRole.FN_CAIRT]: "FN CAIRT",
  [WorkStaffRole.OTHER]: "Other",
  [WorkStaffRole.TEAM_CO_LEAD]: "Team Co-Lead",
};
