import { trackClient } from "apiManager/clients";
import { Task } from "models/task";
import { TaskTemplate, TemplateInput } from "models/template";
import { TrackTaskTemplateDto, TrackTemplateTaskDto } from "./dto";
import { toTaskTemplate, toTemplateTask } from "./mapper";

/** A plain object so Cypress can stub its methods. */
export const taskTemplatesApi = {
  list: async (): Promise<TaskTemplate[]> =>
    (await trackClient.get<TrackTaskTemplateDto[]>("task-templates")).map(
      toTaskTemplate,
    ),

  /** The templates for a phase of a work's type under its EA act. */
  listFor: async ({
    eaActId,
    workTypeId,
    phaseId,
  }: {
    eaActId: number;
    workTypeId: number;
    phaseId: number;
  }): Promise<TaskTemplate[]> =>
    (
      await trackClient.get<TrackTaskTemplateDto[]>(
        `task-templates?work_type_id=${workTypeId}&ea_act_id=${eaActId}&phase_id=${phaseId}`,
      )
    ).map(toTaskTemplate),

  get: async (id: number): Promise<TaskTemplate> =>
    toTaskTemplate(
      await trackClient.get<TrackTaskTemplateDto>(`task-templates/${id}`),
    ),

  listTasks: async (id: number): Promise<Task[]> =>
    (
      await trackClient.get<TrackTemplateTaskDto[]>(
        `task-templates/${id}/tasks`,
      )
    ).map(toTemplateTask),

  /** Posts the form values as multipart, parts in the form's order. */
  create: async (input: TemplateInput): Promise<void> => {
    await trackClient.postMultipart("task-templates", input);
  },

  setActive: async (id: number, isActive: boolean): Promise<void> => {
    await trackClient.patch(`task-templates/${id}`, { is_active: isActive });
  },

  remove: async (id: number): Promise<void> => {
    await trackClient.delete(`task-templates/${id}`);
  },
};
