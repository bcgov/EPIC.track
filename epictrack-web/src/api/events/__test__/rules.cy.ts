import Moment from "moment";
import { ApiError } from "apiManager/apiError";
import {
  EVENT_TYPE,
  EventPosition,
  EventsGridModel,
  EventTemplateVisibility,
  MilestoneEvent,
} from "models/event";
import EventConfiguration from "models/eventConfiguration";
import { EVENT_STATUS } from "models/taskEvent";
import { EventCategory, EventType } from "../ids";
import {
  DECISION_MAKER_POSITION_IDS,
  calendarIconKey,
  canDeleteRow,
  compareEventRows,
  dateLabels,
  defaultAnticipatedDate,
  eventInputs,
  extensionDaysRequired,
  extensionForOverage,
  findResumptionConfiguration,
  findTimeLimitExtensionConfiguration,
  isAnticipatedDateLocked,
  isDecisionCategory,
  isEndEventOutOfOrder,
  isPushPreconfirmed,
  isPushRequired,
  isStartOrEndEvent,
  isUnprocessableEventError,
  milestoneToRow,
  requiresActSection,
  requiresDecisionInputs,
  requiresNumberOfDays,
  showsDatePushWarning,
} from "../rules";

const config = (overrides: Partial<EventConfiguration> = {}) =>
  ({
    id: 1,
    name: "Milestone",
    event_category_id: EventCategory.MILESTONE,
    event_type_id: 1,
    multiple_days: false,
    event_position: EventPosition.INTERMEDIATE,
    visibility: EventTemplateVisibility.OPTIONAL,
    work_phase_id: 55,
    ...overrides,
  }) as EventConfiguration;

const extension = config({ event_category_id: EventCategory.EXTENSION });
const decision = config({ event_category_id: EventCategory.DECISION });
const suspension = config({ event_type_id: EventType.TIME_LIMIT_SUSPENSION });
const multiDay = config({ multiple_days: true });
const endEvent = config({ event_position: EventPosition.END });
const startEvent = config({ event_position: EventPosition.START });
const pcp = (eventTypeId: number) =>
  config({ event_category_id: EventCategory.PCP, event_type_id: eventTypeId });

const milestone = (configuration: EventConfiguration) =>
  ({ id: 1, event_configuration: configuration }) as MilestoneEvent;

const row = (overrides: Partial<EventsGridModel>) =>
  ({
    type: EVENT_TYPE.MILESTONE,
    event_configuration: config(),
    visibility: EventTemplateVisibility.OPTIONAL,
    is_complete: false,
    ...overrides,
  }) as EventsGridModel;

const allFalse = {
  extension: false,
  multipleDays: false,
  pcp: false,
  singleDayPcp: false,
  decision: false,
  suspension: false,
};

describe("event rules", () => {
  it("picks the event form's inputs for each kind of event", () => {
    const cases: [string, EventConfiguration | undefined, boolean, object][] = [
      ["no configuration", undefined, false, {}],
      ["plain milestone", config(), true, {}],
      ["multi-day milestone", multiDay, false, { multipleDays: true }],
      [
        "multi-day extension",
        { ...extension, multiple_days: true },
        false,
        { extension: true },
      ],
      ["PCP comment period", pcp(1), false, { pcp: true }],
      ["open house", pcp(EventType.OPEN_HOUSE), false, { singleDayPcp: true }],
      [
        "virtual open house",
        pcp(EventType.VIRTUAL_OPEN_HOUSE),
        false,
        { singleDayPcp: true },
      ],
      ["decision before it happens", decision, false, {}],
      ["decision with an actual date", decision, true, { decision: true }],
      ["time-limit suspension", suspension, false, { suspension: true }],
    ];
    cases.forEach(([name, configuration, actualAdded, shown]) => {
      expect(eventInputs(configuration, actualAdded), name).to.deep.equal({
        ...allFalse,
        ...shown,
      });
    });
  });

  it("requires the fields each kind of event needs", () => {
    expect(requiresNumberOfDays(multiDay)).to.equal(true);
    expect(requiresNumberOfDays(extension)).to.equal(true);
    expect(requiresNumberOfDays(config())).to.equal(false);

    expect(requiresDecisionInputs(decision, true)).to.equal(true);
    expect(requiresDecisionInputs(decision, false)).to.equal(false);
    expect(requiresDecisionInputs(config(), true)).to.equal(false);

    expect(requiresActSection(extension)).to.equal(true);
    expect(requiresActSection(suspension)).to.equal(true);
    expect(requiresActSection(config())).to.equal(false);
  });

  it("labels the dates by kind of event", () => {
    expect(dateLabels(extension)).to.deep.equal({
      anticipated: "Anticipated Order Date",
      actual: "Actual Order Date",
    });
    expect(dateLabels(multiDay)).to.deep.equal({
      anticipated: "Anticipated Start Date",
      actual: "Actual Start Date",
    });
    expect(dateLabels(config())).to.deep.equal({
      anticipated: "Anticipated Date",
      actual: "Actual Date",
    });
    expect(dateLabels(undefined).anticipated).to.equal("Anticipated Date");
  });

  it("finds the resumption milestone type", () => {
    const resumption = config({
      id: 38,
      event_type_id: EventType.TIME_LIMIT_RESUMPTION,
    });
    expect(findResumptionConfiguration([config(), resumption])).to.equal(
      resumption,
    );
    expect(findResumptionConfiguration([config()])).to.equal(undefined);
  });

  it("defaults a new milestone's date to start_at days into the phase", () => {
    const phaseStart = "2026-03-01T00:00:00.000Z";
    expect(
      (
        defaultAnticipatedDate(config({ start_at: 30 }), phaseStart) as Date
      ).toISOString(),
    ).to.equal("2026-03-31T00:00:00.000Z");
    expect(defaultAnticipatedDate(config(), phaseStart)).to.equal(phaseStart);
    expect(defaultAnticipatedDate(undefined, phaseStart)).to.equal(phaseStart);
    expect(defaultAnticipatedDate(config({ start_at: 30 }))).to.equal(
      undefined,
    );
  });

  it("locks the END date of a legislated phase with no progress", () => {
    expect(isAnticipatedDateLocked(endEvent, true, 0)).to.equal(true);
    expect(isAnticipatedDateLocked(endEvent, true, 10)).to.equal(false);
    expect(isAnticipatedDateLocked(endEvent, false, 0)).to.equal(false);
    expect(isAnticipatedDateLocked(endEvent, true, undefined)).to.equal(false);
    expect(isAnticipatedDateLocked(startEvent, true, 0)).to.equal(false);
    expect(isAnticipatedDateLocked(undefined, true, 0)).to.equal(false);
  });

  it("decides when later events are pushed", () => {
    const pushes = {
      phase_end_push_required: true,
      subsequent_event_push_required: true,
      days_pushed: 3,
      extension_days_required: 0,
    };
    expect(isPushRequired(pushes, milestone(config()))).to.equal(true);
    expect(isPushRequired(pushes, undefined)).to.equal(true);
    expect(isPushRequired(pushes, milestone(extension))).to.equal(false);
    expect(isPushRequired(undefined, milestone(config()))).to.equal(false);

    expect(showsDatePushWarning(pushes, true, config())).to.equal(true);
    expect(showsDatePushWarning(pushes, true, extension)).to.equal(false);
    expect(showsDatePushWarning(pushes, false, config())).to.equal(false);

    expect(isPushPreconfirmed(milestone(extension))).to.equal(true);
    expect(isPushPreconfirmed(milestone(config()))).to.equal(false);
    expect(isPushPreconfirmed(undefined)).to.equal(false);
  });

  it("builds the extension a legislated END needs, dated with the END", () => {
    const timeLimitExtension = config({
      id: 7,
      name: "s.38 Extension of Time Limit",
      event_category_id: EventCategory.EXTENSION,
      event_type_id: EventType.TIME_LIMIT_EXTENSION,
    });
    const check = {
      phase_end_push_required: false,
      subsequent_event_push_required: true,
      days_pushed: 5,
      extension_days_required: 5,
    };

    expect(extensionDaysRequired(check)).to.equal(5);
    expect(extensionDaysRequired(undefined)).to.equal(0);
    expect(
      findTimeLimitExtensionConfiguration([config(), timeLimitExtension]),
    ).to.equal(timeLimitExtension);
    expect(findTimeLimitExtensionConfiguration([config()])).to.equal(undefined);
    expect(
      extensionForOverage(
        timeLimitExtension,
        "2026-07-05T00:00:00.000Z",
        5,
        1,
        "",
      ),
    ).to.deep.equal({
      name: "s.38 Extension of Time Limit",
      event_configuration_id: 7,
      anticipated_date: "2026-07-05T00:00:00.000Z",
      actual_date: "2026-07-05T00:00:00.000Z",
      number_of_days: 5,
      act_section_id: 1,
      reason: undefined,
    });
  });

  it("lists the decision maker positions and the report's decision category", () => {
    expect(DECISION_MAKER_POSITION_IDS).to.equal("1,2");
    expect(isDecisionCategory(EventCategory.DECISION)).to.equal(true);
    expect(isDecisionCategory(EventCategory.MILESTONE)).to.equal(false);
  });

  it("turns a milestone into an event list row", () => {
    const now = Moment("2026-03-15T12:00:00Z");
    const base = {
      id: 9,
      name: "Submission",
      event_configuration: config({
        visibility: EventTemplateVisibility.MANDATORY,
      }),
    } as MilestoneEvent;

    const done = milestoneToRow(
      {
        ...base,
        anticipated_date: "2026-03-01T00:00:00Z",
        actual_date: "2026-03-02T00:00:00Z",
      },
      now,
    );
    expect(done).to.include({
      type: EVENT_TYPE.MILESTONE,
      start_date: "2026-03-02T00:00:00Z",
      is_complete: true,
      status: EVENT_STATUS.COMPLETED,
      visibility: EventTemplateVisibility.MANDATORY,
      name: "Submission",
    });
    expect(
      milestoneToRow(
        { ...base, anticipated_date: "2026-03-10T00:00:00Z", actual_date: "" },
        now,
      ).status,
    ).to.equal(EVENT_STATUS.INPROGRESS);
    expect(
      milestoneToRow(
        { ...base, anticipated_date: "2026-04-10T00:00:00Z", actual_date: "" },
        now,
      ).status,
    ).to.equal(EVENT_STATUS.NOT_STARTED);
  });

  it("sorts the event list", () => {
    const rows = [
      row({
        id: 2,
        start_date: "2026-03-01",
        event_configuration: endEvent,
        is_complete: true,
      }),
      row({ id: 3, start_date: "2026-03-05" }),
      row({
        id: 5,
        type: EVENT_TYPE.TASK,
        name: "Task 10",
        start_date: "2026-03-05",
      }),
      row({
        id: 4,
        start_date: "2026-03-05",
        visibility: EventTemplateVisibility.MANDATORY,
      }),
      row({
        id: 6,
        type: EVENT_TYPE.TASK,
        name: "Task 2",
        start_date: "2026-03-05",
      }),
      row({ id: 7, start_date: "2026-03-03" }),
      row({ id: 1, start_date: "2026-03-10", event_configuration: startEvent }),
    ];
    // START, then by date; mandatory before optional; milestones before
    // tasks, tasks by name; a completed END last.
    expect([...rows].sort(compareEventRows).map((r) => r.id)).to.deep.equal([
      1, 7, 4, 3, 6, 5, 2,
    ]);
  });

  it("warns when a mandatory event sorts after the END event", () => {
    const end = row({ id: 2, event_configuration: endEvent });
    const mandatory = row({
      id: 3,
      visibility: EventTemplateVisibility.MANDATORY,
    });
    expect(isEndEventOutOfOrder([end, mandatory])).to.equal(true);
    expect(isEndEventOutOfOrder([mandatory, end])).to.equal(false);
    expect(isEndEventOutOfOrder([mandatory])).to.equal(false);
    expect(isEndEventOutOfOrder([end, row({ id: 4 })])).to.equal(false);
  });

  it("only lets optional rows be deleted, and bolds START and END", () => {
    expect(canDeleteRow(row({}))).to.equal(true);
    expect(
      canDeleteRow(row({ visibility: EventTemplateVisibility.MANDATORY })),
    ).to.equal(false);
    expect(
      canDeleteRow(row({ type: EVENT_TYPE.TASK, visibility: undefined })),
    ).to.equal(true);
    // An outcome can make an optional milestone the phase's end.
    expect(canDeleteRow(row({ event_configuration: endEvent }))).to.equal(
      false,
    );
    expect(canDeleteRow(row({ event_configuration: startEvent }))).to.equal(
      false,
    );

    expect(isStartOrEndEvent(startEvent)).to.equal(true);
    expect(isStartOrEndEvent(endEvent)).to.equal(true);
    expect(isStartOrEndEvent(config())).to.equal(false);
  });

  it("recognizes the errors the lock dialog shows", () => {
    const apiError = (code: string) =>
      new ApiError({ client: "track", status: 422, code, message: "No" });
    expect(isUnprocessableEventError(apiError("UnprocessableEventError"))).to.be
      .true;
    expect(isUnprocessableEventError(apiError("UnprocessableEndEventError"))).to
      .be.true;
    expect(isUnprocessableEventError(apiError("SomethingElse"))).to.be.false;
    expect(isUnprocessableEventError(new Error("UnprocessableEventError"))).to
      .be.false;
  });

  it("picks the calendar icon", () => {
    expect(calendarIconKey(row({ type: EVENT_TYPE.TASK }))).to.equal("Task");
    expect(
      calendarIconKey(
        row({
          event_configuration: config({ event_type_id: EventType.SUBMISSION }),
        }),
      ),
    ).to.equal("Submission");
    expect(calendarIconKey(row({ event_configuration: decision }))).to.equal(
      "Decision",
    );
    expect(calendarIconKey(row({ event_configuration: pcp(1) }))).to.equal(
      "PCP",
    );
    expect(calendarIconKey(row({}))).to.equal("Milestone");
  });
});
