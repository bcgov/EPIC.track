import Insights from "..";

describe("Main Component inside InsightsContextProvider", () => {
  it("renders work insights", () => {
    cy.mount(<Insights />);

    cy.contains("Work Insights").should("be.visible"); // Work Insights is open by default
    cy.contains("Project Insights").should("not.exist"); // Projects Insights is not open
  });

  it("renders the buttons to switch to project insights", () => {
    cy.mount(<Insights />);

    cy.get('[data-cy="project-insights-tab-button"]').click(); // Click on Project tab button

    cy.contains("Project Insights").should("exist"); // Project Insights is now open
    cy.contains("Work Insights").should("not.exist"); // Work Insights is not open
  });
});
