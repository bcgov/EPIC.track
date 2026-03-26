import { MemoryRouter as Router } from "react-router-dom";
import StatusContainer from "../StatusContainer";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import { StatusContext } from "../StatusContext";

describe("StatusContainer", () => {
  it("renders status content and allows switching to notes tab", () => {
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            loading: false,
            work: {
              id: 101,
              current_work_phase_id: 2,
              status_notes: "",
              report_description: "Status report description",
              project: {
                name: "Status Project",
                description: "Project description",
              },
            } as any,
            statuses: [],
            issues: [
              {
                id: 1,
                title: "Issue 1",
                is_active: true,
                is_resolved: false,
                updates: [
                  {
                    id: 10,
                    description: "Issue update",
                    is_approved: true,
                  },
                ],
              },
            ] as any,
            workPhases: [
              {
                work_phase: { id: 2, name: "In Review" },
              },
            ] as any,
            loadIssues: async () => {},
          }}
        >
          <StatusContext.Provider
            value={{
              openStatusForm: () => {},
              openApproveStatusDialog: () => {},
              setShowStatusForm: () => {},
              status: null,
              setStatus: () => {},
              onSave: () => {},
              setShowApproveStatusDialog: () => {},
              selectedHistoryIndex: 0,
              setSelectedHistoryIndex: () => {},
              setIsCloning: () => {},
              workId: "101",
              isCloning: false,
            }}
          >
            <StatusContainer />
          </StatusContext.Provider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Status").should("exist");
    cy.contains("Reports Preview").should("exist");
    cy.contains("Notes").should("exist");
    cy.contains("You don't have any Statuses yet").should("exist");
    cy.contains("30-60-90 Preview").should("exist");

    cy.contains("Notes").click();
    cy.contains("30-60-90 Preview").should("not.exist");
  });
});
