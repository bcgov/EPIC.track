import { ListType } from "./code";

export interface Template extends ListType {
  name: string;
  ea_act: ListType;
  work_type: ListType;
  phase: ListType;
  ea_act_id?: number;
  work_type_id?: number;
  phase_id?: number;
  template_file: FileList | undefined;
  is_active: boolean;
}

export interface TemplateApprove {
  is_active: boolean;
}
