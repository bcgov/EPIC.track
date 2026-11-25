/** EventConfigurationResponseSchema. */
export interface TrackEventConfigurationDto {
  id: number;
  name: string;
  parent_id: number | null;
  template_id: number;
  event_type_id: number;
  event_category_id: number;
  event_position: string;
  multiple_days: boolean;
  /** A string column, e.g. "30". */
  start_at: string | null;
  number_of_days: number;
  sort_order: number;
  work_phase_id: number;
  visibility: string;
  repeat_count: number;
  is_active: boolean;
}

/** EventResponseSchema. */
export interface TrackMilestoneEventDto {
  id: number;
  name: string;
  description: string;
  anticipated_date: string;
  actual_date: string;
  number_of_days: number;
  outcome_id?: number;
  is_active: boolean;
  source_event_id: number | null;
  work_id: number;
  event_configuration_id: number;
  high_priority: boolean;
  act_section_id: number;
  reason: string;
  decision_maker_id: number;
  number_of_attendees: number;
  number_of_responses: number;
  topic: string;
  notes: string;
  event_configuration: TrackEventConfigurationDto;
}

/** A milestones/calendar item, built by EventService._serialize_event. */
export interface TrackCalendarItemDto {
  work_name: string;
  work_id: number;
  phase_name: string;
  phase_id: number;
  event: TrackMilestoneEventDto;
}

/** EventDateChangePosibilityCheckResponseSchema. */
export interface TrackDateCheckDto {
  work_phase_to_be_exceeded: unknown;
  event: unknown;
  phase_end_push_required: boolean;
  subsequent_event_push_required: boolean;
  days_pushed: number;
  /** Missing from an API that predates it. */
  extension_days_required?: number;
}

/** OutcomeConfigurationResponseSchema and ActSectionResponseSchema. */
export interface TrackNamedOptionDto {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
}

/** MilestoneEventBodyParameterSchema. */
export type TrackMilestoneWriteDto = Partial<Record<string, unknown>>;
