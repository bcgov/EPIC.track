import { trackClient } from "apiManager/clients";
import { CalendarSearchOptions, CalendarTask } from "models/event";
import { MyTask } from "models/task";
import {
  TaskBulkUpdateInput,
  TaskEvent,
  TaskEventInput,
  TaskEventItem,
} from "models/taskEvent";
import { TrackCalendarTaskDto, TrackMyTaskDto, TrackTaskEventDto } from "./dto";
import {
  toCalendarTask,
  toMyTask,
  toTaskEvent,
  toTaskEventItem,
  toTaskWriteDto,
} from "./mapper";

/** A plain object so Cypress can stub its methods. */
export const tasksApi = {
  listForPhase: async (workPhaseId: number): Promise<TaskEventItem[]> =>
    (
      await trackClient.get<TrackTaskEventDto[]>("tasks/events", {
        params: { work_phase_id: workPhaseId },
      })
    ).map(toTaskEventItem),

  get: async (id: number): Promise<TaskEvent> =>
    toTaskEvent(await trackClient.get<TrackTaskEventDto>(`tasks/events/${id}`)),

  create: async (input: TaskEventInput): Promise<TaskEvent> =>
    toTaskEvent(
      await trackClient.post<TrackTaskEventDto>(
        "tasks/events",
        toTaskWriteDto(input),
      ),
    ),

  update: async (id: number, input: TaskEventInput): Promise<TaskEvent> =>
    toTaskEvent(
      await trackClient.put<TrackTaskEventDto>(
        `tasks/events/${id}`,
        toTaskWriteDto(input),
      ),
    ),

  updateMany: async (input: TaskBulkUpdateInput): Promise<void> => {
    await trackClient.patch("tasks/events", input);
  },

  /** The backend rejects unknown query params here, so send only these two. */
  removeMany: async (
    taskIds: (number | string)[],
    workId?: number,
  ): Promise<void> => {
    await trackClient.delete("tasks/events", {
      params: {
        task_ids: taskIds.length ? taskIds.join(",") : undefined,
        work_id: workId,
      },
    });
  },

  listMine: async (staffId: number): Promise<MyTask[]> =>
    (
      await trackClient.get<TrackMyTaskDto[]>(
        `tasks/events/staff-work/${staffId}`,
        { params: { is_active: true } },
      )
    ).map(toMyTask),

  /** Tasks have no event types, so the calendar's type filters aren't sent. */
  listCalendar: async (query: CalendarSearchOptions): Promise<CalendarTask[]> =>
    (
      await trackClient.get<{ items: TrackCalendarTaskDto[] }>(
        "tasks/calendar",
        { params: { ...query, event_types: [] } },
      )
    ).items.map(toCalendarTask),

  importFromTemplate: async (
    templateId: number,
    workPhaseId?: number,
  ): Promise<void> => {
    await trackClient.post(`tasks/templates/${templateId}/events`, {
      work_phase_id: workPhaseId,
    });
  },

  /** Uploads a task sheet (.xlsx) to the phase. */
  importSheet: async (workPhaseId: number, file: File): Promise<void> => {
    await trackClient.postMultipart(`tasks/work_phase/${workPhaseId}/sheet`, {
      template_file: file,
    });
  },
};
