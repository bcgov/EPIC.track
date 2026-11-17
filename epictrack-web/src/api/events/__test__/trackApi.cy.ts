import Moment from "moment";
import { AppConfig } from "config";
import { isApiError } from "apiManager/apiError";
import { EventTemplateVisibility } from "models/event";
import { eventsApi } from "../eventsApi";

const apiPath = new URL(AppConfig.apis.track.baseUrl, window.location.origin)
  .pathname;
const path = (suffix: string) => `${apiPath}${suffix}`;

// Matches EventConfigurationResponseSchema.
const trackConfiguration = {
  id: 9,
  name: "Decision Milestone",
  parent_id: null,
  template_id: 3,
  event_type_id: 1,
  event_category_id: 4,
  event_position: "INTERMEDIATE",
  multiple_days: false,
  start_at: "30",
  number_of_days: 0,
  sort_order: 5,
  work_phase_id: 55,
  visibility: "OPTIONAL",
  repeat_count: 0,
  is_active: true,
};

// Matches EventResponseSchema.
const trackEvent = {
  id: 77,
  name: "Decision issued",
  description: "Minister's decision",
  anticipated_date: "2026-03-20T07:00:00+00:00",
  actual_date: "2026-03-22T07:00:00+00:00",
  number_of_days: 0,
  outcome_id: 5,
  is_active: true,
  source_event_id: null,
  work_id: 101,
  event_configuration_id: 9,
  high_priority: true,
  act_section_id: null,
  reason: null,
  decision_maker_id: 12,
  number_of_attendees: null,
  number_of_responses: null,
  topic: null,
  notes: "Decision notes",
  event_configuration: trackConfiguration,
};

const configuration = {
  id: 9,
  name: "Decision Milestone",
  event_category_id: 4,
  event_type_id: 1,
  multiple_days: false,
  event_position: "INTERMEDIATE",
  visibility: "OPTIONAL",
  work_phase_id: 55,
  start_at: 30,
};

const milestone = {
  id: 77,
  name: "Decision issued",
  description: "Minister's decision",
  anticipated_date: "2026-03-20T07:00:00+00:00",
  actual_date: "2026-03-22T07:00:00+00:00",
  number_of_days: 0,
  outcome_id: 5,
  notes: "Decision notes",
  high_priority: true,
  act_section_id: null,
  reason: null,
  decision_maker_id: 12,
  number_of_attendees: null,
  number_of_responses: null,
  topic: null,
  event_configuration_id: 9,
  event_configuration: configuration,
};

// What EventForm holds when it saves: the event it loaded plus its edits.
const formValues = {
  ...milestone,
  anticipated_date: "2026-03-20T00:00:00-07:00",
  actual_date: new Date("2026-03-22T07:00:00Z"),
  work_id: 101,
} as any;

const WRITABLE = [
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
  "topic",
];

describe("Track events api", () => {
  beforeEach(() => {
    cy.intercept(
      { method: "GET", pathname: path("milestones/workphases/55/events") },
      [
        trackEvent,
        {
          ...trackEvent,
          id: 78,
          event_configuration: { ...trackConfiguration, start_at: null },
        },
      ],
    );
    cy.intercept(
      { method: "GET", pathname: path("milestones/events/77") },
      trackEvent,
    );
    cy.intercept(
      { method: "GET", pathname: path("milestones/events/999") },
      { statusCode: 404, body: { message: "Milestone event not found" } },
    );
    cy.intercept(
      { method: "POST", pathname: path("milestones/workphases/55/events") },
      { statusCode: 201, body: trackEvent },
    ).as("create");
    cy.intercept(
      { method: "PUT", pathname: path("milestones/events/77") },
      trackEvent,
    ).as("update");
    cy.intercept(
      { method: "DELETE", pathname: path("milestones/events/77") },
      { body: "Milestone deleted" },
    ).as("remove");
    cy.intercept(
      { method: "POST", pathname: path("milestones/check-events") },
      {
        work_phase_to_be_exceeded: null,
        event: trackEvent,
        phase_end_push_required: true,
        subsequent_event_push_required: false,
        days_pushed: 3,
      },
    ).as("check");
    cy.intercept(
      { method: "GET", pathname: path("milestones/calendar") },
      {
        items: [
          {
            work_name: "Copper Mine - Assessment",
            work_id: 101,
            phase_name: "Decision",
            phase_id: 55,
            event: trackEvent,
          },
        ],
        total: 1,
      },
    ).as("calendar");
    cy.intercept({ method: "GET", pathname: path("event-configurations/") }, [
      trackConfiguration,
    ]).as("configurations");
    cy.intercept({ method: "GET", pathname: path("outcome-configurations/") }, [
      {
        id: 5,
        name: "Approved",
        event_configuration_id: 9,
        outcome_template_id: 2,
        sort_order: 1,
        is_active: true,
      },
    ]).as("outcomes");
    cy.intercept({ method: "GET", pathname: path("act-sections") }, [
      {
        id: 2,
        name: "Section 25",
        ea_act_id: 3,
        sort_order: 1,
        is_active: true,
      },
    ]).as("actSections");
  });

  it("maps milestones and their configuration", () => {
    cy.then(() => eventsApi.listForPhase(55)).then(([first, second]) => {
      expect(first).to.deep.equal(milestone);
      expect(second.event_configuration.start_at).to.equal(undefined);
    });
    cy.then(() => eventsApi.get(77)).should("deep.equal", milestone);
  });

  it("rejects with an ApiError for a missing milestone", () => {
    cy.then(() =>
      eventsApi.get(999).then(
        () => {
          throw new Error("expected get(999) to fail");
        },
        (error) => error,
      ),
    ).then((error) => {
      expect(isApiError(error)).to.equal(true);
      expect(error.status).to.equal(404);
    });
  });

  it("creates with only the writable fields and formatted dates", () => {
    cy.then(() => eventsApi.create(55, formValues, true)).should(
      "deep.equal",
      milestone,
    );
    cy.wait("@create").then(({ request }) => {
      expect(request.query).to.deep.equal({ push_events: "true" });
      expect(request.body).to.have.all.keys(...WRITABLE);
      expect(request.body.anticipated_date).to.equal(
        Moment(formValues.anticipated_date).format(),
      );
      expect(request.body.actual_date).to.equal(
        Moment(formValues.actual_date).format(),
      );
      expect(request.body.notes).to.equal("Decision notes");
    });
  });

  it("updates with push_events=false and leaves an empty actual date as sent", () => {
    cy.then(() =>
      eventsApi.update(77, { ...formValues, actual_date: "" }, false),
    );
    cy.wait("@update").then(({ request }) => {
      expect(request.query).to.deep.equal({ push_events: "false" });
      expect(request.body.actual_date).to.equal("");
      expect(request.body).not.to.have.any.keys(
        "id",
        "event_configuration",
        "work_id",
      );
    });
  });

  it("checks a date push with the dates as the form holds them", () => {
    cy.then(() => eventsApi.checkDatePush(formValues, 77)).should(
      "deep.equal",
      {
        phase_end_push_required: true,
        subsequent_event_push_required: false,
        days_pushed: 3,
      },
    );
    cy.wait("@check").then(({ request }) => {
      expect(request.query).to.deep.equal({ event_id: "77" });
      expect(request.body.anticipated_date).to.equal(
        formValues.anticipated_date,
      );
      expect(request.body.actual_date).to.equal(
        formValues.actual_date.toISOString(),
      );
      expect(request.body).not.to.have.any.keys("id", "event_configuration");
    });
    cy.then(() => eventsApi.checkDatePush(formValues));
    cy.wait("@check").its("request.query").should("deep.equal", {});
  });

  it("deletes a milestone", () => {
    cy.then(() => eventsApi.remove(77));
    cy.wait("@remove").its("request.method").should("equal", "DELETE");
  });

  it("maps calendar milestones and sends the filters as the backend reads them", () => {
    cy.then(() =>
      eventsApi.listCalendar({
        event_types: ["event_category:4"],
        project_types: [],
        regions: ["2"],
        staff_id: null,
        work_ids: [101],
        work_types: [],
        year: 2026,
        teams: [],
      }),
    ).should("deep.equal", [
      {
        event: milestone,
        work_id: 101,
        work_name: "Copper Mine - Assessment",
        phase_id: 55,
        phase_name: "Decision",
      },
    ]);
    cy.wait("@calendar").then(({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.getAll("event_types[]")).to.deep.equal([
        "event_category:4",
      ]);
      expect(params.getAll("regions[]")).to.deep.equal(["2"]);
      expect(params.getAll("work_ids[]")).to.deep.equal(["101"]);
      expect(params.get("year")).to.equal("2026");
      expect(params.has("staff_id")).to.equal(false);
    });
  });

  it("loads the event form's lookups with today's URLs", () => {
    cy.then(() =>
      eventsApi.listConfigurations(55, [
        EventTemplateVisibility.OPTIONAL,
        EventTemplateVisibility.SUGGESTED,
      ]),
    ).should("deep.equal", [configuration]);
    cy.wait("@configurations")
      .its("request.url")
      .should(
        "match",
        /\/event-configurations\/\?work_phase_id=55&visibility_modes=OPTIONAL,SUGGESTED&configurable=true$/,
      );

    cy.then(() => eventsApi.listOutcomes(9)).should("deep.equal", [
      { id: 5, name: "Approved" },
    ]);
    cy.wait("@outcomes")
      .its("request.url")
      .should("match", /\/outcome-configurations\/\?configuration_id=9$/);

    cy.then(() => eventsApi.listActSections(3)).should("deep.equal", [
      { id: 2, name: "Section 25" },
    ]);
    cy.wait("@actSections")
      .its("request.url")
      .should("match", /\/act-sections\?ea_act_id=3$/);
  });
});
