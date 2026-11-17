import Moment from "moment";
import { Assignee, CalendarTask } from "models/event";
import { MyTask, Responsibility } from "models/task";
import {
  EVENT_STATUS,
  TaskEvent,
  TaskEventInput,
  TaskEventItem,
} from "models/taskEvent";
import {
  TrackCalendarTaskDto,
  TrackMyTaskDto,
  TrackTaskAssigneeDto,
  TrackTaskEventDto,
  TrackTaskResponsibilityDto,
  TrackTaskWriteDto,
} from "./dto";

// TaskEventBodyParamSchema's fields; anything else is dropped.
const WRITABLE_FIELDS = [
  "name",
  "work_phase_id",
  "responsibility_ids",
  "start_date",
  "number_of_days",
  "tips",
  "notes",
  "assignee_ids",
  "status",
] as const satisfies readonly (keyof TaskEventInput)[];

const toAssignee = (dto: TrackTaskAssigneeDto): Assignee => ({
  id: dto.id,
  is_active: dto.is_active,
  task_event_id: dto.task_event_id,
  assignee_id: dto.assignee_id,
  assignee: dto.assignee,
});

const toResponsibility = (dto: TrackTaskResponsibilityDto): Responsibility => ({
  id: dto.id,
  is_active: dto.is_active,
  responsibility_id: dto.responsibility_id,
  task_event_id: dto.task_event_id,
});

export const toTaskEventItem = (dto: TrackTaskEventDto): TaskEventItem => ({
  id: dto.id,
  name: dto.name,
  work_phase_id: dto.work_phase_id,
  start_date: dto.start_date,
  number_of_days: dto.number_of_days,
  tips: dto.tips,
  notes: dto.notes,
  status: dto.status as EVENT_STATUS,
  assigned: dto.assigned,
  responsibility: dto.responsibility,
  assignees: dto.assignees.map(toAssignee),
  responsibilities: dto.responsibilities.map(toResponsibility),
});

/** The task form's model; the select ids are strings, as the selects hold them. */
export const toTaskEvent = (dto: TrackTaskEventDto): TaskEvent => ({
  id: dto.id,
  name: dto.name,
  work_phase_id: dto.work_phase_id,
  start_date: dto.start_date,
  number_of_days: dto.number_of_days,
  tips: dto.tips,
  notes: dto.notes,
  status: dto.status as EVENT_STATUS,
  assignee_ids: dto.assignees.map((a) => a.assignee_id.toString()),
  responsibility_ids: dto.responsibilities.map((r) =>
    r.responsibility_id.toString(),
  ),
});

export const toMyTask = (dto: TrackMyTaskDto): MyTask => ({
  ...toTaskEventItem(dto),
  work: { id: dto.work.id, title: dto.work.title, notes: dto.work.notes },
});

export const toCalendarTask = (dto: TrackCalendarTaskDto): CalendarTask => ({
  event: toTaskEventItem(dto.event),
  work_id: dto.work_id,
  work_name: dto.work_name,
  phase_id: dto.phase_id,
  phase_name: dto.phase_name,
});

/** A save's body: the writable fields, with `start_date` as Moment(x).format(). */
export const toTaskWriteDto = (input: TaskEventInput): TrackTaskWriteDto => {
  const dto: TrackTaskWriteDto = {};
  WRITABLE_FIELDS.forEach((field) => {
    if (input[field] !== undefined) dto[field] = input[field];
  });
  dto.start_date = Moment(input.start_date).format();
  return dto;
};
