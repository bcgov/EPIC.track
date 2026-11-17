import Moment from "moment";
import { AppConfig } from "config";
import {
  TrackWorkDto,
  toWorkWriteDto,
  trackWorksSource,
} from "../sources/track";
import { describeWorksSource } from "./worksSourceContract";

const apiPath = new URL(AppConfig.apis.track.baseUrl, window.location.origin)
  .pathname;
const path = (suffix: string) => `${apiPath}${suffix}`;

const staff = (id: number, full_name: string) =>
  ({ id, full_name, first_name: "A", last_name: "B" }) as any;

// Matches WorkResponseSchema, including fields the mapper drops.
const trackWork: TrackWorkDto & Record<string, unknown> = {
  id: 1,
  title: "Copper Mine - Assessment - North Pit",
  simple_title: "North Pit",
  report_description: "On a date, a proponent submitted a work.",
  epic_description: "An open pit copper mine",
  is_cac_recommended: false,
  is_active: true,
  is_completed: false,
  is_high_priority: true,
  start_date: "2024-01-15T08:00:00+00:00",
  anticipated_decision_date: "2025-06-30T07:00:00+00:00",
  decision_date: "",
  work_decision_date: "",
  first_nation_notes: "FN notes",
  status_notes: "Status notes",
  issue_notes: "Issue notes",
  work_state: "IN_PROGRESS",
  project_id: 7,
  ministry_id: 2,
  ea_act_id: 3,
  eao_team_id: 4,
  federal_involvement_id: 5,
  responsible_epd_id: 11,
  work_lead_id: 12,
  work_type_id: 6,
  current_work_phase_id: 44,
  substitution_act_id: 8,
  eac_decision_by_id: 13,
  decision_by_id: 13,
  decision_maker_position_id: 9,
  start_date_locked: false,
  created_at: "2024-01-10T10:00:00",
  anticipated_referral_date: "2025-03-01T08:00:00+00:00",
  project: {
    id: 7,
    name: "Copper Mine",
    description: "An open pit copper mine",
    proponent: { id: 5, name: "Mining Co" },
  } as any,
  ministry: { id: 2, name: "Mines", abbreviation: "EMLI" } as any,
  ea_act: { id: 3, name: "EA Act (2018)" },
  eao_team: { id: 4, name: "Team A" },
  federal_involvement: { id: 5, name: "None" },
  responsible_epd: staff(11, "Pat Lead"),
  work_lead: staff(12, "Sam Lead"),
  work_type: { id: 6, name: "Assessment" },
  current_work_phase: {
    id: 44,
    name: "Early Engagement",
    phase: { id: 1, name: "Early Engagement" },
  } as any,
  substitution_act: { id: 8, name: "None" },
  eac_decision_by: staff(13, "Min Ister"),
  decision_by: staff(13, "Min Ister"),
  indigenous_works: [],
  work_status_stoplight: "GREEN",
  project_tracking_number: null,
  work_tracking_number: null,
};

const stubTrackWire = () => {
  cy.intercept({ method: "GET", pathname: path("works") }, [
    trackWork,
    { ...trackWork, id: 2, current_work_phase: null },
  ]).as("list");
  cy.intercept({ method: "GET", pathname: path("works/options") }, [
    { id: 1, title: "Copper Mine - Assessment - North Pit" },
  ]);
  cy.intercept({ method: "GET", pathname: path("works/1") }, trackWork);
  cy.intercept(
    { method: "GET", pathname: path("works/999") },
    { statusCode: 404, body: { message: "Work not found" } },
  );
  cy.intercept(
    { method: "POST", pathname: path("works") },
    { statusCode: 201, body: { ...trackWork, id: 2 } },
  ).as("create");
  cy.intercept({ method: "PUT", pathname: path("works/1") }, trackWork).as(
    "update",
  );
  cy.intercept({ method: "GET", pathname: path("works/exists") }, (req) =>
    req.reply({ exists: req.query.title === "Taken Work" }),
  ).as("exists");
};

describeWorksSource("Track", trackWorksSource, stubTrackWire);

describe("Track works source", () => {
  beforeEach(stubTrackWire);

  it("keeps only the project ref on a work", () => {
    cy.then(() => trackWorksSource.get(1)).then((work) => {
      expect(work.project).to.deep.equal({ id: 7, name: "Copper Mine" });
      expect(work).not.to.have.any.keys(
        "work_status_stoplight",
        "project_tracking_number",
      );
      expect(work.issue_notes).to.equal("Issue notes");
      expect(work.current_work_phase?.id).to.equal(44);
    });
  });

  it("maps a work to its list row", () => {
    cy.then(() => trackWorksSource.list()).then(([first, second]) => {
      expect(first).to.deep.equal({
        id: 1,
        title: "Copper Mine - Assessment - North Pit",
        is_active: true,
        work_state: "IN_PROGRESS",
        project: { id: 7, name: "Copper Mine" },
        ea_act: { name: "EA Act (2018)" },
        work_type: { name: "Assessment" },
        eao_team: { name: "Team A" },
        current_work_phase: { name: "Early Engagement" },
      });
      expect(second.current_work_phase).to.equal(null);
    });
    cy.wait("@list").its("request.query").should("deep.equal", {});
  });

  it("sends only the fields the API accepts, with the start date as the form did", () => {
    const startDate = new Date("2024-02-01T08:00:00Z");
    const formValues = { ...trackWork, start_date: startDate };
    cy.then(() => trackWorksSource.update(1, formValues as any));
    cy.wait("@update")
      .its("request.body")
      .should((body) => {
        expect(body).to.have.all.keys(
          "simple_title",
          "report_description",
          "epic_description",
          "start_date",
          "ea_act_id",
          "work_type_id",
          "project_id",
          "ministry_id",
          "federal_involvement_id",
          "substitution_act_id",
          "eao_team_id",
          "responsible_epd_id",
          "work_lead_id",
          "decision_by_id",
          "is_active",
          "is_high_priority",
          "is_cac_recommended",
        );
        expect(body.start_date).to.equal(Moment(startDate).format());
        expect(body.simple_title).to.equal("North Pit");
        expect(body.work_lead_id).to.equal(12);
      });
  });

  it("leaves out fields the form didn't set", () => {
    expect(toWorkWriteDto({ simple_title: "Only title" })).to.deep.equal({
      simple_title: "Only title",
    });
  });

  it("keeps the Track query parameters", () => {
    cy.then(() => trackWorksSource.checkExists("Taken Work", 1));
    cy.wait("@exists")
      .its("request.query")
      .should("deep.equal", { title: "Taken Work", work_id: "1" });
    cy.then(() => trackWorksSource.checkExists("Taken Work"));
    cy.wait("@exists")
      .its("request.query")
      .should("deep.equal", { title: "Taken Work" });
  });
});
