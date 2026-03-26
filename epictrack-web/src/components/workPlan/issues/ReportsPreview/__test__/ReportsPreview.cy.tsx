import { ReportsPreview } from "../index";
import {
  WorkplanContext,
  initialWorkPlanContext,
} from "../../../WorkPlanContext";

const baseContext = {
  ...initialWorkPlanContext,
  loading: false,
  work: {
    id: 101,
    current_work_phase_id: 2,
    report_description: "Work description",
    project: {
      name: "River Project",
      description: "Project description",
    },
  } as any,
  workPhases: [
    {
      work_phase: { id: 2, name: "In Review" },
    },
  ] as any,
  statuses: [],
  issues: [],
};

describe("Issues ReportsPreview", () => {
  it("renders loading skeleton while workplan data is loading", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...baseContext,
          loading: true,
        }}
      >
        <ReportsPreview />
      </WorkplanContext.Provider>,
    );

    cy.get(".MuiSkeleton-root").should("have.length", 3);
    cy.contains("30-60-90").should("not.exist");
    cy.contains("Referral Schedule").should("not.exist");
  });

  it("shows 30-60-90 by default and switches to referral schedule tab", () => {
    cy.mount(
      <WorkplanContext.Provider value={baseContext as any}>
        <ReportsPreview />
      </WorkplanContext.Provider>,
    );

    cy.contains("30-60-90 Preview").should("exist");
    cy.contains("Referral Schedule").should("exist");

    cy.contains("button", "Referral Schedule").click();
    cy.contains("Referral Schedule").should("exist");
    cy.contains("30-60-90 Preview").should("not.exist");

    cy.contains("button", "30-60-90").click();
    cy.contains("30-60-90 Preview").should("exist");
  });
});
