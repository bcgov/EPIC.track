import Moment from "moment";
import { ListType } from "models/code";
import {
  CalendarMilestone,
  EventPosition,
  EventTemplateVisibility,
  MilestoneEvent,
  MilestoneEventDateCheck,
  MilestoneEventInput,
} from "models/event";
import EventConfiguration from "models/eventConfiguration";
import {
  TrackCalendarItemDto,
  TrackDateCheckDto,
  TrackEventConfigurationDto,
  TrackMilestoneEventDto,
  TrackMilestoneWriteDto,
  TrackNamedOptionDto,
} from "./dto";

// MilestoneEventBodyParameterSchema's fields; anything else is dropped.
const WRITABLE_FIELDS = [
  "name",
  "description",
  "anticipated_date",
  "actual_date",
  "number_of_days",
  "event_configuration_id",
  "outcome_id",
  "notes",
  "high_priority",
  "act_section_id",
  "reason",
  "decision_maker_id",
  "number_of_attendees",
  "number_of_responses",
  "start_at",
  "topic",
] as const satisfies readonly (keyof MilestoneEventInput)[];

export const toEventConfiguration = (
  dto: TrackEventConfigurationDto,
): EventConfiguration => ({
  id: dto.id,
  name: dto.name,
  event_category_id: dto.event_category_id,
  event_type_id: dto.event_type_id,
  multiple_days: dto.multiple_days,
  event_position: dto.event_position as EventPosition,
  visibility: dto.visibility as EventTemplateVisibility,
  work_phase_id: dto.work_phase_id,
  start_at: dto.start_at == null ? undefined : Number(dto.start_at),
});

export const toMilestoneEvent = (
  dto: TrackMilestoneEventDto,
): MilestoneEvent => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  anticipated_date: dto.anticipated_date,
  actual_date: dto.actual_date,
  number_of_days: dto.number_of_days,
  outcome_id: dto.outcome_id,
  notes: dto.notes,
  high_priority: dto.high_priority,
  act_section_id: dto.act_section_id,
  reason: dto.reason,
  decision_maker_id: dto.decision_maker_id,
  number_of_attendees: dto.number_of_attendees,
  number_of_responses: dto.number_of_responses,
  topic: dto.topic,
  event_configuration_id: dto.event_configuration_id,
  event_configuration: toEventConfiguration(dto.event_configuration),
});

export const toCalendarMilestone = (
  dto: TrackCalendarItemDto,
): CalendarMilestone => ({
  event: toMilestoneEvent(dto.event),
  work_id: dto.event.work_id,
  work_name: dto.work_name,
  phase_id: dto.phase_id,
  phase_name: dto.phase_name,
});

export const toDateCheck = (
  dto: TrackDateCheckDto,
): MilestoneEventDateCheck => ({
  phase_end_push_required: dto.phase_end_push_required,
  subsequent_event_push_required: dto.subsequent_event_push_required,
  days_pushed: dto.days_pushed,
});

export const toNamedOption = (dto: TrackNamedOptionDto): ListType => ({
  id: dto.id,
  name: dto.name,
});

export const toMilestoneWriteDto = (
  input: MilestoneEventInput,
): TrackMilestoneWriteDto => {
  const dto: TrackMilestoneWriteDto = {};
  WRITABLE_FIELDS.forEach((field) => {
    if (input[field] !== undefined) dto[field] = input[field];
  });
  return dto;
};

/** A save's body: the write fields, with dates as Moment(x).format(). */
export const toMilestoneSaveDto = (
  input: MilestoneEventInput,
): TrackMilestoneWriteDto => {
  const dto = toMilestoneWriteDto(input);
  dto.anticipated_date = Moment(input.anticipated_date).format();
  if (input.actual_date) dto.actual_date = Moment(input.actual_date).format();
  return dto;
};
