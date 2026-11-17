interface TrackNamedDto {
  id: number;
  name: string;
}

/** TaskTemplateResponseSchema. */
export interface TrackTaskTemplateDto {
  id: number;
  name: string;
  ea_act_id: number;
  work_type_id: number;
  phase_id: number;
  is_active: boolean;
  ea_act: TrackNamedDto;
  work_type: TrackNamedDto;
  phase: TrackNamedDto;
}

/** TaskResponseSchema: a task in a template. */
export interface TrackTemplateTaskDto {
  id: number;
  name: string;
  start_at: number;
  number_of_days: number;
  template_id: number;
  responsibility_id: number | null;
  tips: string;
  is_active: boolean;
}
