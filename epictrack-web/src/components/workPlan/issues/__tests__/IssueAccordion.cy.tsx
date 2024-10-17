import React from "react";
import IssueAccordion from "../IssueAccordion";
import { WorkIssue, WorkIssueUpdate } from "models/Issue";
import { IssuesContext, initialIssueContextValue } from "../IssuesContext";
import { faker } from "@faker-js/faker";

const mockIssue: WorkIssue = {
  id: 1,
  title: faker.lorem.words(2),
  start_date: faker.date.recent().toDateString(),
  expected_resolution_date: "2021-10-01",
  is_active: true,
  is_high_priority: true,
  work_id: 1,
  is_deleted: false,
  created_by: "John Doe",
  created_at: "2021-10-01",
  updated_by: "John Doe",
  updated_at: "2021-10-01",
  updates: [],
};

type GenerateMockIssueUpdate = {
  approved: boolean;
  mockIssue: WorkIssue;
};
const generateMockIssueUpdate = ({
  approved,
  mockIssue,
}: GenerateMockIssueUpdate): WorkIssueUpdate => {
  return {
    id: faker.number.int(),
    work_issue_id: mockIssue.id,
    description: faker.lorem.paragraph(1),
    is_active: true,
    is_deleted: false,
    approved_by: faker.person.fullName(),
    is_approved: approved,
    posted_date: faker.date.recent().toDateString(),
  };
};

const initContextWrapper = () => {
  const ContextWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <IssuesContext.Provider
        value={{
          ...initialIssueContextValue,
        }}
      >
        {children}
      </IssuesContext.Provider>
    );
  };
  return [ContextWrapper];
};

describe("<IssueAccordion />", () => {
  it("renders", () => {
    const [ContextWrapper] = initContextWrapper();
    const mockUpdates = [
      generateMockIssueUpdate({ approved: true, mockIssue }),
    ];
    const mockIssueOne = {
      ...mockIssue,
      updates: mockUpdates,
    };

    cy.mount(
      <ContextWrapper>
        <IssueAccordion issue={mockIssueOne} />
      </ContextWrapper>
    );

    // Assert that the issue details are visible
    cy.get('[data-cy="issue-title"]')
      .should("be.visible")
      .contains(mockIssueOne.title);
    cy.get('[data-cy="issue-description"]')
      .should("be.visible")
      .contains(mockUpdates[0].description);

    cy.get('[data-cy="issue-title"]');

    cy.get('[data-cy="approved-chip"]');
    cy.get('[data-cy="new-issue-update-button"]');
    cy.get('[data-cy="edit-issue-update-button"]');
    cy.get('[data-cy="empty-issue-history"]');

    // Click to collapse accordion
    cy.get(`[data-cy="${mockIssue.id}-expand-icon"]`).click();

    // Assert that the issue details are not visible
    cy.get('[data-cy="issue-title"]')
      .should("be.visible")
      .contains(mockIssue.title);
    cy.get('[data-cy="issue-description"]')
      .should("not.be.visible")
      .contains(mockUpdates[0].description);
  });

  it("unapproved update", () => {
    const [ContextWrapper] = initContextWrapper();
    const mockUpdates = [
      generateMockIssueUpdate({ approved: false, mockIssue }),
    ];
    const mockIssueOne = {
      ...mockIssue,
      updates: mockUpdates,
    };

    cy.mount(
      <ContextWrapper>
        <IssueAccordion issue={mockIssueOne} />
      </ContextWrapper>
    );

    // Assert that the issue details are visible
    cy.get('[data-cy="issue-title"]')
      .should("be.visible")
      .contains(mockIssueOne.title);
    cy.get('[data-cy="issue-description"]')
      .should("be.visible")
      .contains(mockUpdates[0].description);

    cy.get('[data-cy="need-approval-chip"]').should("be.visible");
    cy.get('[data-cy="approved-chip"]').should("not.exist");
    cy.get('[data-cy="new-issue-update-button"]').should("not.exist");
    cy.get('[data-cy="approve-issue-update-button"]').should("be.visible");
    cy.get('[data-cy="edit-issue-update-button"]');

    cy.get('[data-cy="empty-issue-history"]');
  });

  it("Unapproved with Issue History", () => {
    const [ContextWrapper] = initContextWrapper();
    const mockUpdates = [
      generateMockIssueUpdate({ approved: false, mockIssue }),
      generateMockIssueUpdate({ approved: true, mockIssue }),
      generateMockIssueUpdate({ approved: true, mockIssue }),
    ];
    const mockIssueOne: WorkIssue = {
      ...mockIssue,
      updates: mockUpdates,
    };

    cy.mount(
      <ContextWrapper>
        <IssueAccordion issue={mockIssueOne} />
      </ContextWrapper>
    );

    // Assert that the issue details are visible
    cy.get('[data-cy="issue-title"]')
      .should("be.visible")
      .contains(mockIssue.title);
    cy.get('[data-cy="issue-description"]')
      .should("be.visible")
      .contains(mockUpdates[0].description);

    cy.get('[data-cy="need-approval-chip"]').should("be.visible");
    cy.get('[data-cy="approved-chip"]').should("not.exist");
    cy.get('[data-cy="new-issue-update-button"]').should("not.exist");
    cy.get('[data-cy="approve-issue-update-button"]').should("be.visible");
    cy.get('[data-cy="edit-issue-update-button"]');

    cy.get('[data-cy="empty-issue-history"]').should("not.exist");

    cy.get(`[data-cy="history-update-${mockUpdates[1].id}"]`)
      .should("be.visible")
      .find("p")
      .contains(mockUpdates[1].description);

    cy.get(`[data-cy="history-update-${mockUpdates[2].id}"]`)
      .should("be.visible")
      .find("p")
      .contains(mockUpdates[2].description);

    cy.get('[data-cy="edit-history-update-button"]').should("be.visible");
  });

  it("Approved with Issue History", () => {
    const [ContextWrapper] = initContextWrapper();
    const mockUpdates = [
      generateMockIssueUpdate({ approved: true, mockIssue }),
      generateMockIssueUpdate({ approved: true, mockIssue }),
      generateMockIssueUpdate({ approved: true, mockIssue }),
    ];
    const mockIssueOne = {
      ...mockIssue,
      updates: mockUpdates,
    };

    cy.mount(
      <ContextWrapper>
        <IssueAccordion issue={mockIssueOne} />
      </ContextWrapper>
    );

    // Assert that the issue details are visible
    cy.get('[data-cy="issue-title"]')
      .should("be.visible")
      .contains(mockIssueOne.title);
    cy.get('[data-cy="issue-description"]')
      .should("be.visible")
      .contains(mockUpdates[0].description);

    cy.get('[data-cy="approved-chip"]').should("be.visible");
    cy.get('[data-cy="new-issue-update-button"]').should("be.visible");
    cy.get('[data-cy="edit-issue-update-button"]');

    cy.get('[data-cy="empty-issue-history"]').should("not.exist");

    cy.get(`[data-cy="history-update-${mockUpdates[1].id}"]`)
      .should("be.visible")
      .find("p")
      .contains(mockUpdates[1].description);

    cy.get(`[data-cy="history-update-${mockUpdates[2].id}"]`)
      .should("be.visible")
      .find("p")
      .contains(mockUpdates[2].description);

    cy.get('[data-cy="edit-history-update-button"]').should("not.exist");
  });
});
