import { MemoryRouter as Router } from "react-router-dom";
import WorkList from "../WorkList";
import { InsightsContext } from "components/insights/InsightsContext";
import { TableFilterProvider } from "components/insights/TableFilterContext";
import { AppConfig } from "config";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../../../../cypress/support/utils";

const works = [
  {
    id: 201,
    title: "Northern Corridor",
    ministry: { name: "MoT", sort_order: 1 },
    federal_involvement: { name: "IAA", sort_order: 1 },
    indigenous_works: [{ name: "Nation A" }],
    rel_staff: [{ full_name: "Sam REL" }],
    work_type: { name: "EA" },
  },
  {
    id: 202,
    title: "Lakeside Upgrade",
    ministry: { name: "ENV", sort_order: 2 },
    federal_involvement: { name: "CEAA", sort_order: 2 },
    indigenous_works: [{ name: "Nation B" }],
    rel_staff: [{ full_name: "Taylor REL" }],
    work_type: { name: "Amendment" },
  },
] as any[];

const endpoints: Endpoint[] = [
  {
    name: "getWorksWithNations",
    method: "GET",
    url: `${AppConfig.apiUrl}works?*include_indigenous_nations=true*`,
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

describe("Partners WorkList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders partner listing columns and data", () => {
    mountComponent();

    cy.wait("@getWorksWithNations");
    cy.contains("Name").should("exist");
    cy.contains("Other Ministry").should("exist");
    cy.contains("First Nations").should("exist");
    cy.contains("REL").should("exist");
    cy.contains("Northern Corridor").should("exist");
    cy.contains("Nation A").should("exist");
    cy.contains("Sam REL").should("exist");
  });

  it("includes staff id in query for user insights", () => {
    mountComponent(true, 17);

    cy.wait("@getWorksWithNations")
      .its("request.url")
      .should("include", "staff_id=17");
  });

  it("shows export icon button", () => {
    mountComponent();

    cy.get("button .icon").first().parent("button").should("exist");
  });
});
