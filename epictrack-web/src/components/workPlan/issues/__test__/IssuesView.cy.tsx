import IssuesView from "../IssuesView";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import { IssuesContext, initialIssueContextValue } from "../IssuesContext";

describe("IssuesView", () => {
  it("shows issue list, warning banner, and create-issue action", () => {
    const setCreateIssueFormIsOpen = cy.stub().as("setCreateIssueFormIsOpen");

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          loading: false,
          team: [
            {
              staff: { email: "" },
              role: { name: "Other" },
              is_active: true,
            },
          ] as any,
          issueStalenessSetting: {
            staleness_length: 1,
            warning_length: 0,
          } as any,
          issues: [
            {
              id: 901,
              title: "Permit timeline risk",
              is_active: true,
              is_resolved: false,
              start_date: "2024-01-10T00:00:00.000Z",
              expected_resolution_date: "2026-04-01T00:00:00.000Z",
              updates: [
                {
                  id: 77,
                  work_issue_id: 901,
                  description: "Pending review by partner agency",
                  is_approved: true,
                  posted_date: "2024-01-15T00:00:00.000Z",
                },
              ],
            },
          ] as any,
        }}
      >
        <IssuesContext.Provider
          value={{
            ...initialIssueContextValue,
            isIssuesLoading: false,
            setCreateIssueFormIsOpen,
          }}
        >
          <IssuesView />
        </IssuesContext.Provider>
      </WorkplanContext.Provider>,
    );

    cy.contains("Permit timeline risk").should("exist");
    cy.contains("One of the Work issues is out of date").should("exist");
    cy.contains("button", "Issue").click();
    cy.get("@setCreateIssueFormIsOpen").should("have.been.calledWith", true);
  });
});
