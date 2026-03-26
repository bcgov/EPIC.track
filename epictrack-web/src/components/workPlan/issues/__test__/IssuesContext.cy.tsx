import React from "react";
import { MemoryRouter as Router } from "react-router-dom";
import { Button } from "@mui/material";
import { AppConfig } from "config";
import { IssuesContext, IssuesProvider } from "../IssuesContext";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "createIssue",
    method: "POST",
    url: `${AppConfig.apiUrl}work/101/issues`,
    response: {
      statusCode: 200,
      body: { id: 44 },
    },
  },
  {
    name: "editIssue",
    method: "PATCH",
    url: `${AppConfig.apiUrl}work/101/issues/44`,
    response: {
      statusCode: 200,
      body: { id: 44 },
    },
  },
  {
    name: "editIssueUpdate",
    method: "PATCH",
    url: `${AppConfig.apiUrl}work/101/issues/44/update/88`,
    response: {
      statusCode: 200,
      body: { id: 88 },
    },
  },
  {
    name: "approveIssueUpdate",
    method: "PATCH",
    url: `${AppConfig.apiUrl}work/101/issues/44/update/88/approve`,
    response: {
      statusCode: 200,
      body: {},
    },
  },
  {
    name: "cloneIssueUpdate",
    method: "POST",
    url: `${AppConfig.apiUrl}work/101/issues/44/update`,
    response: {
      statusCode: 200,
      body: { id: 89 },
    },
  },
];

const IssuesContextHarness = () => {
  const {
    addIssue,
    editIssue,
    editIssueUpdate,
    approveIssue,
    cloneIssueUpdate,
    setIssueToEdit,
    setUpdateToEdit,
    setUpdateToClone,
  } = React.useContext(IssuesContext);

  return (
    <>
      <Button
        onClick={() =>
          addIssue({
            title: "New issue",
            description: "Issue description",
            start_date: "2026-03-10",
            expected_resolution_date: "2026-04-10",
            is_active: true,
            is_high_priority: false,
          })
        }
      >
        Add Issue
      </Button>
      <Button
        onClick={() =>
          setIssueToEdit({
            id: 44,
            title: "Existing issue",
            updates: [],
          } as any)
        }
      >
        Prepare Issue Edit
      </Button>
      <Button
        onClick={() =>
          editIssue({
            title: "Edited issue",
            start_date: "2026-03-11",
            expected_resolution_date: "2026-04-11",
            is_active: true,
            is_high_priority: true,
            is_resolved: false,
          })
        }
      >
        Edit Issue
      </Button>
      <Button
        onClick={() =>
          setUpdateToEdit({
            id: 88,
            work_issue_id: 44,
          } as any)
        }
      >
        Prepare Update Edit
      </Button>
      <Button
        onClick={() =>
          editIssueUpdate({
            description: "Updated timeline",
            posted_date: "2026-03-12",
          })
        }
      >
        Edit Update
      </Button>
      <Button onClick={() => approveIssue(44, 88)}>Approve Update</Button>
      <Button
        onClick={() =>
          setUpdateToClone({
            id: 88,
            work_issue_id: 44,
          } as any)
        }
      >
        Prepare Clone
      </Button>
      <Button
        onClick={() =>
          cloneIssueUpdate({
            description: "Cloned status",
            posted_date: "2026-03-13",
          })
        }
      >
        Clone Update
      </Button>
    </>
  );
};

describe("IssuesContext", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("loads issues and creates a new issue", () => {
    const loadIssues = cy.stub().as("loadIssues");

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            issues: [],
            loadIssues,
          }}
        >
          <IssuesProvider workId="101">
            <IssuesContextHarness />
          </IssuesProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.get("@loadIssues").should("have.been.called");

    cy.contains("button", "Add Issue").click();
    cy.wait("@createIssue")
      .its("request.body")
      .then((rawBody) => {
        const body =
          typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
        expect(body).to.include({
          title: "New issue",
          is_active: true,
          is_high_priority: false,
        });
        expect(body.updates).to.deep.equal(["Issue description"]);
      });

    cy.get("@loadIssues").should("have.callCount", 2);
  });

  it("edits, approves, and clones issue updates", () => {
    const loadIssues = cy.stub().as("loadIssues");
    const refetchIssues = cy.stub().as("refetchIssues");

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            issues: [],
            loadIssues,
          }}
        >
          <IssuesProvider workId="101" refetchIssues={refetchIssues}>
            <IssuesContextHarness />
          </IssuesProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("button", "Prepare Issue Edit").click();
    cy.contains("button", "Edit Issue").click();
    cy.wait("@editIssue");

    cy.contains("button", "Prepare Update Edit").click();
    cy.contains("button", "Edit Update").click();
    cy.wait("@editIssueUpdate");

    cy.contains("button", "Approve Update").click();
    cy.wait("@approveIssueUpdate");

    cy.contains("button", "Prepare Clone").click();
    cy.contains("button", "Clone Update").click();
    cy.wait("@cloneIssueUpdate");

    cy.get("@refetchIssues").should("have.callCount", 4);
    cy.get("@loadIssues").should("have.callCount", 5);
  });
});
