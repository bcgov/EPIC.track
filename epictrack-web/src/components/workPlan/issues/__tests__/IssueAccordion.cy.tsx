import React from "react";
import IssueAccordion from "../IssueAccordion";
import { WorkIssue, WorkIssueUpdate } from "models/Issue";
import { IssuesContext, initialIssueContextValue } from "../IssuesContext";

const mockIssueUpdate: WorkIssueUpdate = {
  id: 1,
  work_issue_id: 1,
  description: "Issue Update Description",
  is_active: true,
  is_deleted: false,
  approved_by: "John Doe",
  is_approved: true,
};

const mockIssue: WorkIssue = {
  id: 1,
  title: "Issue Title",
  start_date: "2021-10-01",
  expected_resolution_date: "2021-10-01",
  is_active: true,
  is_high_priority: true,
  work_id: 1,
  is_deleted: false,
  created_by: "John Doe",
  created_at: "2021-10-01",
  updated_by: "John Doe",
  updated_at: "2021-10-01",
  updates: [mockIssueUpdate],
};

const initContextWrapper = () => {
  const mockSetShowIssueForm = cy.spy();
  const ContextWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <IssuesContext.Provider
        value={{
          ...initialIssueContextValue,
          setShowIssuesForm: () => {
            mockSetShowIssueForm();
          },
        }}
      >
        {children}
      </IssuesContext.Provider>
    );
  };
  return [ContextWrapper, mockSetShowIssueForm];
};

describe("<IssueAccordion />", () => {
  it("renders", () => {
    const [ContextWrapper] = initContextWrapper();
    cy.mount(
      <ContextWrapper>
        <IssueAccordion issue={mockIssue} />
      </ContextWrapper>
    );

    // Assert that the issue details are visible
    cy.get('[data-cy="issue-title"]')
      .should("be.visible")
      .contains(mockIssue.title);
    cy.get('[data-cy="issue-description"]')
      .should("be.visible")
      .contains(mockIssue.updates[0].description);

    // Click to collapse accordion
    cy.get(`[data-cy="${mockIssue.id}-expand-icon"]`).click();

    // Assert that the issue details are not visible
    cy.get('[data-cy="issue-title"]')
      .should("be.visible")
      .contains(mockIssue.title);
    cy.get('[data-cy="issue-description"]')
      .should("not.be.visible")
      .contains(mockIssue.updates[0].description);
  });
});
