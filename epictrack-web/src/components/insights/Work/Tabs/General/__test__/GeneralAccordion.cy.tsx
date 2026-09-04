import { MemoryRouter as Router } from "react-router-dom";
import General from "../index";
import { InsightsContext } from "components/insights/InsightsContext";
import { TableFilterProvider } from "components/insights/TableFilterContext";
import { AppConfig } from "config";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../../../cypress/support/utils";

const works = [
  {
    id: 401,
    title: "Riverbend Crossing",
    project: { name: "Project Riverbend" },
    work_type: { name: "EA" },
    current_work_phase: { name: "Early Engagement" },
  },
] as any[];

const filterOptions = {
  projects: ["Project Riverbend"],
  work_types: ["EA"],
  phases: ["Early Engagement"],
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
  {
    name: "getChartData",
    method: "POST",
    url: `${AppConfig.apiUrl}insights/works`,
    response: { body: [{ work_type: "EA", work_type_id: 1, count: 3 }] },
  },
];

describe("General insights accordion", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <Router>
        <InsightsContext.Provider
          value={{
            activeTab: "Work" as any,
            setActiveTab: cy.stub(),
            isUserInsights: false,
            setIsUserInsights: cy.stub(),
            isUserAssignedToWork: true,
            staffId: undefined,
          }}
        >
          <TableFilterProvider>
            <General />
          </TableFilterProvider>
        </InsightsContext.Provider>
      </Router>,
    );
  });

  // The charts skip their request while the shared columnFilters is empty
  it("loads the charts beside the listing", () => {
    cy.wait("@getChartData")
      .its("request.body.filters")
      .should("have.length.greaterThan", 0);

    cy.contains("WORK BY TYPE").should("exist");
  });
});
