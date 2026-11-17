import { AppConfig } from "config";
import { workplansApi } from "../workplansApi";

const apiPath = new URL(AppConfig.apis.track.baseUrl, window.location.origin)
  .pathname;
const path = (suffix: string) => `${apiPath}${suffix}`;

// One works/dashboard item, as WorkService._serialize_work builds it.
const trackWorkplan = {
  id: 101,
  work_state: "IN_PROGRESS",
  work_type: {
    id: 6,
    name: "Assessment",
    sort_order: 3,
    report_title: "Environmental Assessment",
    is_active: true,
  },
  current_work_phase_id: 44,
  federal_involvement: { id: 1, name: "None", is_active: true },
  eao_team: { id: 2, name: "Team A", is_active: true },
  title: "Copper Mine - Assessment - North Pit",
  simple_title: "North Pit",
  is_active: true,
  project: { name: "Copper Mine" },
  phase_info: [
    {
      work_phase: {
        name: "Early Engagement",
        id: 44,
        phase: { color: "#0d6efd" },
        start_date: "2024-01-15T08:00:00+00:00",
        end_date: "2024-04-14T07:00:00+00:00",
        is_completed: false,
      },
      total_number_of_days: 90,
      current_milestone: "Early Engagement Start",
      next_milestone: "Early Engagement Complete",
      next_milestone_date: "2024-04-14T07:00:00+00:00",
      decision_milestone: null,
      decision: null,
      decision_milestone_date: null,
      milestone_progress: 50,
      days_left: 40,
    },
  ],
  status_info: {
    id: 9,
    description: "On track",
    posted_date: "2024-02-01T08:00:00+00:00",
    is_approved: true,
    work_id: 101,
    staleness: "GOOD",
  },
  staff_info: [
    {
      id: 5,
      work_id: 101,
      staff_id: 12,
      role_id: 1,
      is_active: true,
      staff: {
        id: 12,
        first_name: "Sam",
        last_name: "Lead",
        full_name: "Lead, Sam",
        email: "sam.lead@gov.bc.ca",
        phone: "250-555-0100",
        is_active: true,
        position_id: 3,
        position: { id: 3, name: "Project Assessment Officer" },
        idir_user_id: "SLEAD",
        last_active_at: "2024-02-01T08:00:00+00:00",
      },
      role: { id: 1, name: "Team Lead", is_active: true },
    },
  ],
};

describe("Track workplans api", () => {
  beforeEach(() => {
    cy.intercept(
      { method: "GET", pathname: path("works/dashboard") },
      {
        items: [
          trackWorkplan,
          {
            ...trackWorkplan,
            id: 102,
            current_work_phase_id: null,
            phase_info: undefined,
            status_info: {},
          },
        ],
        total: 2,
      },
    ).as("dashboard");
  });

  const search = {
    teams: ["1", "2"],
    work_states: ["IN_PROGRESS"],
    regions: [],
    project_types: [],
    work_types: ["6"],
    text: "copper",
    staff_id: 99,
  };

  it("keeps the fields the cards and Gantt read", () => {
    cy.then(() =>
      workplansApi.list({
        page: 1,
        size: 12,
        sortOrder: "asc",
        sortKey: "title",
        search,
      }),
    ).then(({ items: [first, second], total }) => {
      expect(total).to.equal(2);
      expect(first).to.deep.equal({
        id: 101,
        title: "Copper Mine - Assessment - North Pit",
        simple_title: "North Pit",
        is_active: true,
        work_state: "IN_PROGRESS",
        current_work_phase_id: 44,
        work_type: { id: 6, name: "Assessment" },
        federal_involvement: { name: "None" },
        eao_team: { name: "Team A" },
        project: { name: "Copper Mine" },
        phase_info: [trackWorkplan.phase_info[0]],
        status_info: {
          posted_date: "2024-02-01T08:00:00+00:00",
          description: "On track",
        },
        staff_info: [
          {
            id: 5,
            staff: {
              id: 12,
              first_name: "Sam",
              last_name: "Lead",
              full_name: "Lead, Sam",
              email: "sam.lead@gov.bc.ca",
              phone: "250-555-0100",
              position: { name: "Project Assessment Officer" },
            },
            role: { name: "Team Lead" },
          },
        ],
      });
      expect(second.phase_info).to.deep.equal([]);
      expect(second.status_info.posted_date).to.equal(undefined);
      expect(second.current_work_phase_id).to.equal(null);
    });
  });

  it("sends the filters as the backend reads them", () => {
    cy.then(() =>
      workplansApi.list({
        page: 2,
        size: 12,
        sortOrder: "asc",
        sortKey: "title",
        search,
      }),
    );
    cy.wait("@dashboard").then(({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get("page")).to.equal("2");
      expect(params.get("size")).to.equal("12");
      expect(params.get("sort_order")).to.equal("asc");
      expect(params.get("sort_key")).to.equal("title");
      expect(params.getAll("teams[]")).to.deep.equal(["1", "2"]);
      expect(params.getAll("work_states[]")).to.deep.equal(["IN_PROGRESS"]);
      expect(params.getAll("work_types[]")).to.deep.equal(["6"]);
      expect(params.has("regions[]")).to.equal(false);
      expect(params.get("text")).to.equal("copper");
      expect(params.get("staff_id")).to.equal("99");
    });
  });
});
