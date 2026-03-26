import { MemoryRouter as Router } from "react-router-dom";
import IssuesContainer from "../IssuesContainer";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import { IssuesContext, initialIssueContextValue } from "../IssuesContext";

describe("IssuesContainer", () => {
  it("renders issues section and allows switching to notes tab", () => {
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            loading: false,
            issues: [],
            statuses: [],
            work: {
              id: 101,
              issue_notes: "",
              current_work_phase_id: 2,
              report_description: "Work summary",
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
          }}
        >
          <IssuesContext.Provider
            value={{
              ...initialIssueContextValue,
              isIssuesLoading: false,
              workId: "101",
            }}
          >
            <IssuesContainer />
          </IssuesContext.Provider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Issues").should("exist");
    cy.contains("Reports Preview").should("exist");
    cy.contains("Notes").should("exist");
    cy.contains("You don't have any Issues yet").should("exist");
    cy.contains("30-60-90 Preview").should("exist");

    cy.contains("Notes").click();
    cy.contains("30-60-90 Preview").should("not.exist");
  });
});
