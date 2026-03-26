import { MemoryRouter as Router } from "react-router-dom";
import WorkList from "../workListing";
import { InsightsContext } from "components/insights/InsightsContext";
import { TableFilterProvider } from "components/insights/TableFilterContext";
import { AppConfig } from "config";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../../../../cypress/support/utils";
import { WorkStaffRole } from "models/role";

const works = [
  {
    id: 101,
    title: "Alpha Work",
    eao_team_id: 1,
    eao_team: { id: 1, name: "Team One" },
  },
  {
    id: 102,
    title: "Beta Work",
    eao_team_id: 2,
    eao_team: { id: 2, name: "Team Two" },
  },
] as any[];

const workStaffs = [
  {
    id: 1,
    eao_team: { id: 1, name: "Team One" },
    work_lead: { full_name: "Lead One" },
    staff: [
      {
        id: 7,
        first_name: "Alex",
        last_name: "Analyst",
        role: { id: WorkStaffRole.OFFICER_ANALYST },
      },
      {
        id: 8,
        first_name: "Casey",
        last_name: "Colead",
        role: { id: WorkStaffRole.TEAM_CO_LEAD },
      },
    ],
  },
  {
    id: 2,
    eao_team: { id: 2, name: "Team Two" },
    work_lead: { full_name: "Lead Two" },
    staff: [
      {
        id: 22,
        first_name: "Riley",
        last_name: "Reviewer",
        role: { id: WorkStaffRole.OFFICER_ANALYST },
      },
    ],
  },
] as any[];

const endpoints: Endpoint[] = [
  {
    name: "getWorkStaffs",
    method: "GET",
    url: `${AppConfig.apiUrl}works/resources?is_active=true`,
    response: { body: workStaffs },
  },
  {
    name: "getWorks",
    method: "GET",
    url: `${AppConfig.apiUrl}works?*`,
    response: { body: works },
  },
];

const mountComponent = (isUserInsights = false, staffId?: number) => {
  cy.mount(
    <Router>
      <InsightsContext.Provider
        value={{
          activeTab: "Work" as any,
          setActiveTab: cy.stub(),
          isUserInsights,
          setIsUserInsights: cy.stub(),
          isUserAssignedToWork: true,
          staffId,
        }}
      >
        <TableFilterProvider>
          <WorkList />
        </TableFilterProvider>
      </InsightsContext.Provider>
    </Router>,
  );
};

describe("Staff WorkListing", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders listing and loads hook data", () => {
    mountComponent();

    cy.wait("@getWorkStaffs");
    cy.wait("@getWorks");
    cy.contains("Name").should("exist");
    cy.contains("Team").should("exist");
    cy.contains("Staff").should("exist");
    cy.contains("Lead").should("exist");
    cy.contains("Team One").should("exist");
    cy.contains("Lead One").should("exist");
  });

  it("passes staffId to works query for user insights", () => {
    mountComponent(true, 7);

    cy.wait("@getWorks").its("request.url").should("include", "staff_id=7");
  });

  it("shows export action in top toolbar", () => {
    mountComponent();

    cy.get("button .icon").first().parent("button").should("exist");
  });
});
