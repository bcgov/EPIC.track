import { MemoryRouter as Router } from "react-router-dom";
import { AppConfig } from "config";
import FirstNationContainer from "../FirstNationContainer";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "checkFirstNationAvailability",
    method: "GET",
    url: `${AppConfig.apiUrl}projects/88/first-nation-available*`,
    response: {
      body: {
        first_nation_available: true,
      },
    },
  },
];

describe("FirstNationContainer", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders empty-state and switches to resources tab", () => {
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            loading: false,
            firstNations: [],
            work: {
              id: 101,
              title: "Test Work",
              project_id: 88,
              project: { name: "Project 88" },
              first_nation_notes: "",
            } as any,
          }}
        >
          <FirstNationContainer />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.wait("@checkFirstNationAvailability");

    cy.contains("First Nations").should("exist");
    cy.contains("Notes").should("exist");
    cy.contains("Resources").should("exist");
    cy.contains("You don't have any First Nations yet").should("exist");

    cy.contains("Resources").click();
    cy.contains("Link to Consultative Areas Database (CAD)").should("exist");
  });
});
