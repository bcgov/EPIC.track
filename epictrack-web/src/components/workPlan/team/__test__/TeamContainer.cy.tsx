import { MemoryRouter as Router } from "react-router-dom";
import TeamContainer from "../TeamContainer";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";

describe("TeamContainer", () => {
  it("shows team headings and empty-state content", () => {
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            loading: false,
            team: [],
            work: {
              id: 101,
              eao_team: { name: "Northern Team" },
              work_lead: { full_name: "Avery Lead" },
              responsible_epd: { full_name: "Casey EPD" },
            } as any,
          }}
        >
          <TeamContainer />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Team Members").should("exist");
    cy.contains("Team Information").should("exist");
    cy.contains("You don't have any Team Members yet").should("exist");
    cy.contains("Start adding your Team").should("exist");
  });
});
