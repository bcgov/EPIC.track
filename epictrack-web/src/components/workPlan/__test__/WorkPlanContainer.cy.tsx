import { MemoryRouter as Router } from "react-router-dom";
import WorkPlanContainer from "../WorkPlanContainer";
import { WorkplanContext, initialWorkPlanContext } from "../WorkPlanContext";

describe("WorkPlanContainer", () => {
  it("renders workplan tabs and empty phase state", () => {
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            loading: false,
            work: {
              id: 101,
              title: "Sample Work",
              work_state: "IN_PROGRESS",
            } as any,
            team: [
              {
                is_active: true,
                staff: { email: "test@example.com" },
              },
            ] as any,
            firstNations: [{ id: 1, is_active: true }] as any,
            statuses: [],
            issues: [],
            workPhases: [],
          }}
        >
          <WorkPlanContainer />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Sample Work").should("exist");
    cy.contains("Workplan").should("exist");
    cy.contains("Calendar").should("exist");
    cy.contains("Status").should("exist");
    cy.contains("Issues").should("exist");
    cy.contains("About").should("exist");
    cy.contains("Team").should("exist");
    cy.contains("First Nations").should("exist");
    cy.contains("This work has no phases to be displayed").should("exist");
  });
});
