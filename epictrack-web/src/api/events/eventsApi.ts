import { trackClient } from "apiManager/clients";
import { ListType } from "models/code";
import {
  CalendarMilestone,
  CalendarSearchOptions,
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
  TrackNamedOptionDto,
} from "./dto";
import {
  toCalendarMilestone,
  toDateCheck,
  toEventConfiguration,
  toMilestoneEvent,
  toMilestoneSaveDto,
  toMilestoneWriteDto,
  toNamedOption,
} from "./mapper";

/** A plain object so Cypress can stub its methods. */
export const eventsApi = {
  listForPhase: async (workPhaseId: number): Promise<MilestoneEvent[]> =>
    (
      await trackClient.get<TrackMilestoneEventDto[]>(
        `milestones/workphases/${workPhaseId}/events`,
      )
    ).map(toMilestoneEvent),

  get: async (eventId: number): Promise<MilestoneEvent> =>
    toMilestoneEvent(
      await trackClient.get<TrackMilestoneEventDto>(
        `milestones/events/${eventId}`,
      ),
    ),

  create: async (
    workPhaseId: number,
    input: MilestoneEventInput,
    pushEvents: boolean,
  ): Promise<MilestoneEvent> =>
    toMilestoneEvent(
      await trackClient.post<TrackMilestoneEventDto>(
        `milestones/workphases/${workPhaseId}/events`,
        toMilestoneSaveDto(input),
        { params: { push_events: pushEvents } },
      ),
    ),

  update: async (
    eventId: number,
    input: MilestoneEventInput,
    pushEvents: boolean,
  ): Promise<MilestoneEvent> =>
    toMilestoneEvent(
      await trackClient.put<TrackMilestoneEventDto>(
        `milestones/events/${eventId}`,
        toMilestoneSaveDto(input),
        { params: { push_events: pushEvents } },
      ),
    ),

  remove: async (eventId: number): Promise<void> => {
    await trackClient.delete(`milestones/events/${eventId}`);
  },

  /** Whether saving `input` would exceed the phase or push later events. */
  checkDatePush: async (
    input: MilestoneEventInput,
    eventId?: number,
  ): Promise<MilestoneEventDateCheck> =>
    toDateCheck(
      await trackClient.post<TrackDateCheckDto>(
        "milestones/check-events",
        toMilestoneWriteDto(input),
        { params: { event_id: eventId || undefined } },
      ),
    ),

  /** Filter arrays go out as `event_types[]=event_category:4`. */
  listCalendar: async (
    query: CalendarSearchOptions,
  ): Promise<CalendarMilestone[]> =>
    (
      await trackClient.get<{ items: TrackCalendarItemDto[] }>(
        "milestones/calendar",
        { params: { ...query } },
      )
    ).items.map(toCalendarMilestone),

  /** The milestone types a user can add to the phase. */
  listConfigurations: async (
    workPhaseId: number,
    visibilities: EventTemplateVisibility[],
  ): Promise<EventConfiguration[]> =>
    (
      await trackClient.get<TrackEventConfigurationDto[]>(
        // Built by hand: as a param, the modes would go out as visibility_modes[].
        `event-configurations/?work_phase_id=${workPhaseId}&visibility_modes=${visibilities}&configurable=true`,
      )
    ).map(toEventConfiguration),

  listOutcomes: async (configurationId: number): Promise<ListType[]> =>
    (
      await trackClient.get<TrackNamedOptionDto[]>(
        `outcome-configurations/?configuration_id=${configurationId}`,
      )
    ).map(toNamedOption),

  listActSections: async (eaActId: number): Promise<ListType[]> =>
    (
      await trackClient.get<TrackNamedOptionDto[]>(
        `act-sections?ea_act_id=${eaActId}`,
      )
    ).map(toNamedOption),
};
