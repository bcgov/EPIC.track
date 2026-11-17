import { Task } from "models/task";
import { TaskTemplate } from "models/template";
import { TrackTaskTemplateDto, TrackTemplateTaskDto } from "./dto";

const toRef = (dto: { id: number; name: string }) => ({
  id: dto.id,
  name: dto.name,
});

export const toTaskTemplate = (dto: TrackTaskTemplateDto): TaskTemplate => ({
  id: dto.id,
  name: dto.name,
  ea_act_id: dto.ea_act_id,
  work_type_id: dto.work_type_id,
  phase_id: dto.phase_id,
  ea_act: toRef(dto.ea_act),
  work_type: toRef(dto.work_type),
  phase: toRef(dto.phase),
  is_active: dto.is_active,
});

export const toTemplateTask = (dto: TrackTemplateTaskDto): Task => ({
  id: dto.id,
  name: dto.name,
  start_at: dto.start_at,
  number_of_days: dto.number_of_days,
  template_id: dto.template_id,
  tips: dto.tips,
  responsibility_id: dto.responsibility_id,
});
