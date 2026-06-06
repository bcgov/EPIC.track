import IssueDetails from "../Details";
import {
  WorkplanContext,
  initialWorkPlanContext,
} from "../../../WorkPlanContext";
import { IssuesContext, initialIssueContextValue } from "../../IssuesContext";
import { StalenessEnum } from "../../../../../constants/application-constant";
import { store } from "../../../../../store";

const currentEmail = store.getState().user.userDetail.email;

const baseIssue = {
  id: 44,
  title: "Funding risk",
  is_active: true,
  is_resolved: false,
  updates: [
    {
      id: 88,
      work_issue_id: 44,
      posted_date: "2026-03-10T00:00:00.000Z",
      description: "Pending review",
      is_approved: false,
      staleness: StalenessEnum.WARN,
    },
  ],
} as any;

const renderIssueDetails = (issue: any, issuesOverrides?: any) => {
  cy.mount(
    <WorkplanContext.Provider
      value={{
        ...initialWorkPlanContext,
        team: [
          {
            is_active: true,
            staff: { email: currentEmail },
            role: { name: "Team Member" },
          },
        ] as any,
        ...issuesOverrides,
      }}
    >
      <IssuesContext.Provider
        value={{
          ...initialIssueContextValue,
          ...issuesOverrides,
        }}
      >
        <IssueDetails
          issue={issue}
          showStalenessIcon
          headingCaption="Issue heading"
        />
      </IssuesContext.Provider>
    </WorkplanContext.Provider>,
  );
};

describe("IssueDetails", () => {
  it("opens approve dialog and saves approved issue update", () => {
    const approveIssue = cy.stub().as("approveIssue");
    const setIssueToApproveId = cy.stub().as("setIssueToApproveId");

    renderIssueDetails(baseIssue, {
      approveIssue,
      setIssueToApproveId,
      issueToApproveId: 44,
    });

    cy.contains("Approve this Issue?").should("exist");
    cy.contains("button", "Save").click();

    cy.get("@approveIssue").should("have.been.calledWith", 44, 88);
    cy.get("@setIssueToApproveId").should("have.been.calledWith", null);
  });

  it("shows staleness icon and requests approval when latest update is unapproved", () => {
    const setIssueToApproveId = cy.stub().as("setIssueToApproveId");

    renderIssueDetails(baseIssue, {
      setIssueToApproveId,
      issueToApproveId: null,
    });

    cy.get('[aria-label="staleness level"]').should("exist");
    cy.get('[data-cy="need-approval-chip"]').should("exist");
    cy.get('[data-cy="approve-issue-update-button"]').click();
    cy.get("@setIssueToApproveId").should("have.been.calledWith", 44);
  });

  it("creates a new update when latest update is already approved", () => {
    const setUpdateToClone = cy.stub().as("setUpdateToClone");
    const setNewIssueUpdateFormIsOpen = cy
      .stub()
      .as("setNewIssueUpdateFormIsOpen");
    const approvedIssue = {
      ...baseIssue,
      updates: [
        {
          ...baseIssue.updates[0],
          is_approved: true,
          description: "Approved update",
        },
      ],
    };

    renderIssueDetails(approvedIssue, {
      setUpdateToClone,
      setNewIssueUpdateFormIsOpen,
      issueToApproveId: null,
    });

    cy.get('[data-cy="approved-chip"]').should("exist");
    cy.get('[data-cy="new-issue-update-button"]').click();
    cy.get("@setUpdateToClone").should("have.been.called");
    cy.get("@setNewIssueUpdateFormIsOpen").should("have.been.calledWith", true);
  });
});
