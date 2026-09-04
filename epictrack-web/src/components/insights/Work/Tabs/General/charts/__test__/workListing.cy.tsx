import { MemoryRouter as Router } from "react-router-dom";
import WorkList from "../workListing";
import { InsightsContext } from "components/insights/InsightsContext";
import { TableFilterProvider } from "components/insights/TableFilterContext";
import { AppConfig } from "config";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../../../../cypress/support/utils";

const works = [
  {
    id: 401,
    title: "Riverbend Crossing",
    project: { name: "Project Riverbend" },
    work_type: { name: "EA" },
    current_work_phase: { name: "Early Engagement" },
  },
  {
    id: 402,
    title: "Summit Expansion",
    project: { name: "Project Summit" },
    work_type: { name: "Amendment" },
    current_work_phase: { name: "Application Review" },
  },
] as any[];

const filterOptions = {
  projects: ["Project Riverbend", "Project Summit"],
  work_types: ["Amendment", "EA"],
  phases: ["Application Review", "Early Engagement"],
  ministries: [],
  federal_involvements: [],
  indigenous_nations: [],
  rel_staff: [],
  work_states: [],
  started_years: [],
  closed_years: [],
};

const endpoints: Endpoint[] = [
  {
    name: "getWorksListing",
    method: "POST",
    url: `${AppConfig.apiUrl}works/listing`,
    response: { body: { items: works, total: 43 } },
  },
  {
    name: "getFilterOptions",
    method: "GET",
    url: `${AppConfig.apiUrl}works/listing/filter-options*`,
    response: { body: filterOptions },
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

describe("General WorkListing", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders the rows of the fetched page", () => {
    mountComponent();

    cy.wait("@getWorksListing").then(({ request }) => {
      expect(request.body.page).to.equal(1);
      expect(request.body.size).to.equal(15);
    });

    cy.contains("Name").should("exist");
    cy.contains("Project").should("exist");
    cy.contains("Work type").should("exist");
    cy.contains("Current Phase").should("exist");

    cy.contains("Riverbend Crossing").should("exist");
    cy.contains("Project Summit").should("exist");
    cy.contains("Early Engagement").should("exist");
  });

  it("reports the server side total, not the page size", () => {
    mountComponent();

    cy.contains("Results: 43").should("exist");
  });
});
