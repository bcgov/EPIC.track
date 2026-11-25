import Moment from "moment";
import { isApiError } from "apiManager/apiError";
import {
  EVENT_TYPE,
  EventPosition,
  EventsGridModel,
  EventTemplateVisibility,
  MilestoneEvent,
  MilestoneEventDateCheck,
} from "models/event";
import EventConfiguration from "models/eventConfiguration";
import { POSITION_ENUM } from "models/position";
import { EVENT_STATUS } from "models/taskEvent";
import { naturalSortCollator } from "utils";
import { EventCategory, EventType } from "./ids";

type Config = EventConfiguration | null | undefined;

// --- Event kinds ---

export const isExtension = (config: Config) =>
  config?.event_category_id === EventCategory.EXTENSION;

export const isDecision = (config: Config) =>
  config?.event_category_id === EventCategory.DECISION;

export const isPcp = (config: Config) =>
  config?.event_category_id === EventCategory.PCP;

export const isOpenHouse = (config: Config) =>
  [EventType.OPEN_HOUSE, EventType.VIRTUAL_OPEN_HOUSE].includes(
    Number(config?.event_type_id),
  );

export const isTimeLimitSuspension = (config: Config) =>
  config?.event_type_id === EventType.TIME_LIMIT_SUSPENSION;

export const isStartEvent = (config: Config) =>
  config?.event_position === EventPosition.START;

export const isEndEvent = (config: Config) =>
  config?.event_position === EventPosition.END;

export const isStartOrEndEvent = (config: Config) =>
  isStartEvent(config) || isEndEvent(config);

export const isMandatory = (visibility?: EventTemplateVisibility) =>
  visibility === EventTemplateVisibility.MANDATORY;

/** For report rows, which carry only the category id. */
export const isDecisionCategory = (categoryId: unknown) =>
  categoryId === EventCategory.DECISION;

// --- Event form ---

export const requiresNumberOfDays = (config: Config) =>
  config?.multiple_days === true || isExtension(config);

/** Decision outcome and decision maker, once the decision has happened. */
export const requiresDecisionInputs = (config: Config, actualAdded: boolean) =>
  actualAdded && isDecision(config);

export const requiresActSection = (config: Config) =>
  isExtension(config) || isTimeLimitSuspension(config);

/** Which of EventForm's category-specific input blocks to show. */
export const eventInputs = (config: Config, actualAdded: boolean) => ({
  extension: isExtension(config),
  multipleDays: !isExtension(config) && !!config?.multiple_days,
  pcp: isPcp(config) && !isOpenHouse(config),
  singleDayPcp: isOpenHouse(config),
  decision: requiresDecisionInputs(config, actualAdded),
  suspension: isTimeLimitSuspension(config),
});

export const dateLabels = (config: Config) => {
  if (config && isExtension(config)) {
    return {
      anticipated: "Anticipated Order Date",
      actual: "Actual Order Date",
    };
  }
  if (config && config.multiple_days) {
    return {
      anticipated: "Anticipated Start Date",
      actual: "Actual Start Date",
    };
  }
  return { anticipated: "Anticipated Date", actual: "Actual Date" };
};

/** The milestone type a suspended phase must add next. */
export const findResumptionConfiguration = (configs: EventConfiguration[]) =>
  configs.find(
    (config) => config.event_type_id === EventType.TIME_LIMIT_RESUMPTION,
  );

/** A new milestone's date: `start_at` days into the phase, else the phase start. */
export const defaultAnticipatedDate = (
  config: Config,
  phaseStartDate?: string,
): Date | string | undefined => {
  if (config && config.start_at !== undefined && phaseStartDate !== undefined) {
    const startAtDate = new Date(phaseStartDate);
    return new Date(
      startAtDate.getTime() + config.start_at * 24 * 60 * 60 * 1000,
    );
  }
  return phaseStartDate;
};

/** A legislated phase's END date is fixed until the phase has progress. */
export const isAnticipatedDateLocked = (
  config: Config,
  phaseLegislated?: boolean,
  milestoneProgress?: number,
) =>
  Boolean(
    config?.id &&
    phaseLegislated &&
    milestoneProgress === 0 &&
    isEndEvent(config),
  );

// --- Date pushes ---

export const isPushRequired = (
  dateCheck: MilestoneEventDateCheck | undefined,
  event: MilestoneEvent | undefined,
) =>
  Boolean(dateCheck?.subsequent_event_push_required) &&
  !isExtension(event?.event_configuration);

export const showsDatePushWarning = (
  dateCheck: MilestoneEventDateCheck | undefined,
  phaseLegislated: boolean | undefined,
  config: Config,
) =>
  Boolean(dateCheck?.phase_end_push_required && phaseLegislated) &&
  !isExtension(config);

/** Extensions push later events without asking. */
export const isPushPreconfirmed = (event: MilestoneEvent | undefined) =>
  isExtension(event?.event_configuration);

export const DECISION_MAKER_POSITION_IDS = [
  POSITION_ENUM.ASSOCIATE_DEPUTY_MINISTER,
  POSITION_ENUM.ADM,
].join(",");

// --- Event list ---

export const milestoneToRow = (
  milestone: MilestoneEvent,
  now = Moment(),
): EventsGridModel => {
  const element: any = { ...milestone };
  element.type = EVENT_TYPE.MILESTONE;
  element.start_date = element.actual_date || element.anticipated_date;
  element.is_complete = !!element.actual_date;
  const actualToTodayDiff = Moment(element.start_date).diff(now, "days");
  element.status = element.is_complete
    ? EVENT_STATUS.COMPLETED
    : actualToTodayDiff <= 0
      ? EVENT_STATUS.INPROGRESS
      : EVENT_STATUS.NOT_STARTED;
  element.visibility = element.event_configuration.visibility;
  return element;
};

/** START first, a completed END last, then by date, visibility, type and name. */
export const compareEventRows = (
  eventX: EventsGridModel,
  eventY: EventsGridModel,
) => {
  // START milestone should be first, END milestone should be last
  if (
    eventX.event_configuration?.event_position === EventPosition.START ||
    (eventY.event_configuration?.event_position === EventPosition.END &&
      eventY.is_complete)
  ) {
    return -1;
  }
  if (
    eventY.event_configuration?.event_position === EventPosition.START ||
    (eventX.event_configuration?.event_position === EventPosition.END &&
      eventX.is_complete)
  ) {
    return 1;
  }
  // Next priorit is for dates, lower dates comes first
  const diff = Moment(eventX.start_date).diff(eventY.start_date, "days");
  if (diff < 0) {
    return -1;
  }
  if (diff > 0) {
    return 1;
  }
  // Next if the dates are equal, then
  if (Moment(eventX.start_date).diff(eventY.start_date, "days") === 0) {
    // If both events are MILESTONE, sort it based on the visibility
    if (
      eventX.type === EVENT_TYPE.MILESTONE &&
      eventY.type === EVENT_TYPE.MILESTONE
    ) {
      // If both events are either MANDATORY OR OPTIONAL, sort is based on its autogenerated datebase ids
      if (
        (eventX.visibility === EventTemplateVisibility.MANDATORY &&
          eventY.visibility === EventTemplateVisibility.MANDATORY) ||
        (eventX.visibility === EventTemplateVisibility.OPTIONAL &&
          eventY.visibility === EventTemplateVisibility.OPTIONAL)
      ) {
        return eventX.id < eventY.id ? -1 : 1;
      }
      // MANDATORY should be shown first, then OPTIONAL
      if (
        eventX.visibility === EventTemplateVisibility.MANDATORY ||
        eventY.visibility === EventTemplateVisibility.OPTIONAL
      ) {
        return -1;
      }
      if (
        eventY.visibility === EventTemplateVisibility.MANDATORY ||
        eventX.visibility === EventTemplateVisibility.OPTIONAL
      ) {
        return 1;
      }
    }
    // If both events are either MILESTONE or TASK, sort is based on its autogenerated database ids
    if (
      (eventX.type === EVENT_TYPE.MILESTONE &&
        eventY.type === EVENT_TYPE.MILESTONE) ||
      (eventX.type === EVENT_TYPE.TASK && eventY.type === EVENT_TYPE.TASK)
    ) {
      return naturalSortCollator.compare(eventX.name, eventY.name);
    }
    // MILESTONE should shows first, then TASK
    if (
      eventX.type === EVENT_TYPE.MILESTONE ||
      eventY.type === EVENT_TYPE.TASK
    ) {
      return -1;
    }
    if (
      eventY.type === EVENT_TYPE.MILESTONE ||
      eventX.type === EVENT_TYPE.TASK
    ) {
      return 1;
    }
  }
  return diff;
};

export const findEndEvent = (rows: EventsGridModel[]) =>
  rows.find((row) => isEndEvent(row.event_configuration));

/** A mandatory event sorts after the phase's END event. */
export const isEndEventOutOfOrder = (rows: EventsGridModel[]) => {
  const endEvent = findEndEvent(rows);
  if (!endEvent) return false;
  const endEventIndex = rows.indexOf(endEvent);
  const mandatoryEventIndices = rows.reduce<number[]>((indices, row, index) => {
    if (isMandatory(row.visibility)) {
      indices.push(index);
    }
    return indices;
  }, []);
  return (
    mandatoryEventIndices.length > 0 &&
    endEventIndex < Math.max(...mandatoryEventIndices)
  );
};

/** A phase's start and end milestones hold its dates, so they're never deletable, even when optional. */
export const canDeleteRow = (row: EventsGridModel) =>
  (row.type === EVENT_TYPE.MILESTONE || row.type === EVENT_TYPE.TASK) &&
  !isMandatory(row.visibility) &&
  !isStartOrEndEvent(row.event_configuration);

// --- Errors and calendar ---

/** The save broke a date rule; EventForm shows these in the lock dialog. */
export const isUnprocessableEventError = (error: unknown) =>
  isApiError(error) &&
  (error.code === "UnprocessableEventError" ||
    error.code === "UnprocessableEndEventError");

export type CalendarIconKey =
  "Task" | "Submission" | "Decision" | "PCP" | "Milestone";

export const calendarIconKey = (event: EventsGridModel): CalendarIconKey => {
  if (event.type === EVENT_TYPE.TASK) return "Task";
  if (event.event_configuration.event_type_id === EventType.SUBMISSION)
    return "Submission";
  if (event.event_configuration.event_category_id === EventCategory.DECISION)
    return "Decision";
  if (event.event_configuration.event_category_id === EventCategory.PCP)
    return "PCP";
  return "Milestone";
};
