import CreateIssue from "../CreateIssue";
import EditIssue from "../EditIssue";
import EditIssueUpdate from "../EditIssueUpdate";
import NewIssueUpdate from "../NewIssueUpdate";
import { IssuesContext, initialIssueContextValue } from "../../IssuesContext";
import {
  WorkplanContext,
  initialWorkPlanContext,
} from "../../../WorkPlanContext";

describe("Issues forms", () => {
  it("validates create issue form when start date is missing", () => {
    const addIssue = cy.stub().as("addIssue");
    const setCreateIssueFormIsOpen = cy.stub().as("setCreateIssueFormIsOpen");

    cy.mount(
      <IssuesContext.Provider
        value={{
          ...initialIssueContextValue,
          addIssue,
          setCreateIssueFormIsOpen,
        }}
      >
        <CreateIssue />
      </IssuesContext.Provider>,
    );

    cy.get('input[name="title"]').type("Funding risk");
    cy.get('textarea[name="description"]').type(
      "Funding source confirmation pending",
    );
    cy.get("#issue-form").submit();

    cy.contains("Start date is required").should("exist");
    cy.get("@addIssue").should("not.have.been.called");
    cy.get("@setCreateIssueFormIsOpen").should("not.have.been.called");
  });

  it("submits create issue with no expected resolution date", () => {
    const addIssue = cy.stub().as("addIssue");
    const setCreateIssueFormIsOpen = cy.stub().as("setCreateIssueFormIsOpen");

    cy.mount(
      <IssuesContext.Provider
        value={{
          ...initialIssueContextValue,
          addIssue,
          setCreateIssueFormIsOpen,
        }}
      >
        <CreateIssue />
      </IssuesContext.Provider>,
    );

    cy.get('input[name="title"]').type("Funding risk");
    cy.get('textarea[name="description"]').type(
      "Funding source confirmation pending",
    );
    cy.contains("Start Date")
      .parent()
      .within(() => {
        cy.get('[aria-label="Choose date"]').click({ force: true });
      });
    cy.get('[aria-current="date"]').filter(":visible").first().click({
      force: true,
    });
    cy.get("body").type("{esc}");

    cy.get("#issue-form").submit();

    cy.get("@addIssue").should("have.been.calledOnce");
    cy.get("@setCreateIssueFormIsOpen").should("have.been.calledWith", false);
    cy.get("@addIssue").then(() => {
      const payload = addIssue.lastCall.args[0];
      expect(payload.title).to.equal("Funding risk");
      expect(payload.expected_resolution_date).to.equal(undefined);
      expect(payload.is_active).to.equal(true);
      expect(payload.is_high_priority).to.equal(false);
    });
  });

  it("submits create issue with expected resolution date and toggled flags", () => {
    const addIssue = cy.stub().as("addIssue");
    const setCreateIssueFormIsOpen = cy.stub().as("setCreateIssueFormIsOpen");

    cy.mount(
      <IssuesContext.Provider
        value={{
          ...initialIssueContextValue,
          addIssue,
          setCreateIssueFormIsOpen,
        }}
      >
        <CreateIssue />
      </IssuesContext.Provider>,
    );

    cy.get('input[name="title"]').type("Permit alignment risk");
    cy.get('textarea[name="description"]').type("Need timeline alignment");
    cy.contains("Start Date")
      .parent()
      .within(() => {
        cy.get('[aria-label="Choose date"]').click({ force: true });
      });
    cy.get('[aria-current="date"]').filter(":visible").first().click({
      force: true,
    });
    cy.get("body").type("{esc}");

    cy.contains("Expected Resolution Date")
      .parent()
      .within(() => {
        cy.get('[aria-label="Choose date"]').click({ force: true });
      });
    cy.get('[aria-current="date"]').filter(":visible").first().click({
      force: true,
    });
    cy.get("body").type("{esc}");

    cy.contains("p", "Active")
      .closest("label")
      .find(".MuiSwitch-root")
      .click({ force: true });
    cy.contains("p", "High Profile")
      .closest("label")
      .find(".MuiSwitch-root")
      .click({ force: true });

    cy.get("#issue-form").submit();

    cy.get("@addIssue").should("have.been.calledOnce");
    cy.get("@setCreateIssueFormIsOpen").should("have.been.calledWith", false);
    cy.get("@addIssue").then(() => {
      const payload = addIssue.lastCall.args[0];
      expect(payload.is_active).to.equal(false);
      expect(payload.is_high_priority).to.equal(true);
    });
  });

  it("submits edit issue form", () => {
    const editIssue = cy.stub().as("editIssue");
    const setEditIssueFormIsOpen = cy.stub().as("setEditIssueFormIsOpen");
    const setUpdateToEdit = cy.stub().as("setUpdateToEdit");

    cy.mount(
      <IssuesContext.Provider
        value={{
          ...initialIssueContextValue,
          editIssue,
          setEditIssueFormIsOpen,
          setUpdateToEdit,
          issueToEdit: {
            id: 40,
            title: "Existing issue",
            is_active: true,
            is_high_priority: false,
            is_resolved: false,
            start_date: "2026-03-01T00:00:00.000Z",
            expected_resolution_date: "",
            updates: [
              {
                id: 90,
                posted_date: "2026-03-15T00:00:00.000Z",
              },
            ],
          } as any,
        }}
      >
        <EditIssue />
      </IssuesContext.Provider>,
    );

    cy.get("#issue-form").submit();

    cy.get("@editIssue").should("have.been.called");
    cy.get("@setEditIssueFormIsOpen").should("have.been.calledWith", false);
    cy.get("@setUpdateToEdit").should("have.been.calledWith", null);
  });

  it("submits edit issue update form", () => {
    const editIssueUpdate = cy.stub().as("editIssueUpdate");
    const setEditIssueUpdateFormIsOpen = cy
      .stub()
      .as("setEditIssueUpdateFormIsOpen");
    const setUpdateToClone = cy.stub().as("setUpdateToClone");

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          issues: [
            {
              id: 99,
              start_date: "2026-03-01T00:00:00.000Z",
              updates: [
                {
                  id: 1,
                  posted_date: "2026-03-05T00:00:00.000Z",
                  is_approved: true,
                },
                {
                  id: 2,
                  posted_date: "2026-03-07T00:00:00.000Z",
                  is_approved: false,
                },
              ],
            },
          ] as any,
        }}
      >
        <IssuesContext.Provider
          value={{
            ...initialIssueContextValue,
            updateToEdit: {
              id: 2,
              work_issue_id: 99,
              posted_date: "2026-03-07T00:00:00.000Z",
              description: "Pending review",
            } as any,
            editIssueUpdate,
            setEditIssueUpdateFormIsOpen,
            setUpdateToClone,
          }}
        >
          <EditIssueUpdate />
        </IssuesContext.Provider>
      </WorkplanContext.Provider>,
    );

    cy.get("#issue-form").submit();

    cy.get("@editIssueUpdate").should("have.been.called");
    cy.get("@setEditIssueUpdateFormIsOpen").should(
      "have.been.calledWith",
      false,
    );
    cy.get("@setUpdateToClone").should("have.been.calledWith", null);
  });

  it("submits new issue update form", () => {
    const cloneIssueUpdate = cy.stub().as("cloneIssueUpdate");
    const setNewIssueUpdateFormIsOpen = cy
      .stub()
      .as("setNewIssueUpdateFormIsOpen");
    const setUpdateToClone = cy.stub().as("setUpdateToClone");

    cy.mount(
      <IssuesContext.Provider
        value={{
          ...initialIssueContextValue,
          updateToClone: {
            id: 3,
            work_issue_id: 99,
            posted_date: "2026-03-08T00:00:00.000Z",
            description: "Previous update",
          } as any,
          cloneIssueUpdate,
          setNewIssueUpdateFormIsOpen,
          setUpdateToClone,
        }}
      >
        <NewIssueUpdate />
      </IssuesContext.Provider>,
    );

    cy.get("#issue-form").submit();

    cy.get("@cloneIssueUpdate").should("have.been.called");
    cy.get("@setNewIssueUpdateFormIsOpen").should(
      "have.been.calledWith",
      false,
    );
    cy.get("@setUpdateToClone").should("have.been.calledWith", null);
  });
});
