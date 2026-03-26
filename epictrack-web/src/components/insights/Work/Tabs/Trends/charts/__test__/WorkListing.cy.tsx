import { MemoryRouter as Router } from "react-router-dom";
import WorkList from "../WorkListing";
import { InsightsContext } from "components/insights/InsightsContext";
import { TableFilterProvider } from "components/insights/TableFilterContext";
import { AppConfig } from "config";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../../../../cypress/support/utils";

const works = [
  {
    id: 301,
    title: "Coastal Project",
    project: { name: "Project Coast" },
    work_type: { name: "EA" },
    start_date: "2024-01-05T00:00:00.000Z",
    work_decision_date: "2025-06-10T00:00:00.000Z",
    work_state: "IN_PROGRESS",
    is_active: true,
  },
  {
    id: 302,
    title: "Northern Upgrade",
    project: { name: "Project North" },
    work_type: { name: "Amendment" },
    start_date: "2023-03-12T00:00:00.000Z",
    work_decision_date: null,
    work_state: "COMPLETED",
    is_active: false,
  },
] as any[];

const endpoints: Endpoint[] = [
  {
    name: "getAllWorks",
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

describe("Trends WorkListing", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders trends listing columns and rows", () => {
    mountComponent();

    cy.wait("@getAllWorks");
    cy.contains("Name").should("exist");
    cy.contains("Project").should("exist");
    cy.contains("Work type").should("exist");
    cy.contains("Started").should("exist");
    cy.contains("Closed").should("exist");
    cy.contains("Work state").should("exist");
    cy.contains("Status").should("exist");

    cy.contains("Coastal Project").should("exist");
    cy.contains("Northern Upgrade").should("exist");
    cy.contains("Project Coast").should("exist");
    cy.contains("Project North").should("exist");
    cy.contains("Active").should("exist");
    cy.contains("Inactive").should("exist");
  });

  it("includes staff id query param for user insights", () => {
    mountComponent(true, 42);

    cy.wait("@getAllWorks").its("request.url").should("include", "staff_id=42");
  });

  it("shows export icon action", () => {
    mountComponent();

    cy.get("button .icon").first().parent("button").should("exist");
  });
});
