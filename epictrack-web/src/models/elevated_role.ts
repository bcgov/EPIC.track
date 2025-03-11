export interface ElevatedRole {
  id: number;
  name: string;
  description?: string;
}

//Typing matches elevated_role.py model
export enum ElevatedRoleEnum {
  MANAGE_FIRST_NATIONS = 1,
}

export const ElevatedRoleNames: Record<ElevatedRoleEnum, string> = {
  [ElevatedRoleEnum.MANAGE_FIRST_NATIONS]: "Manage First Nations",
};
