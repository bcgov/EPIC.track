import React from "react";
import { MemoryRouter as Router } from "react-router-dom";
import { Button } from "@mui/material";
import { AboutContext, AboutProvider } from "../AboutContext";
import { workService } from "../../../../services/workService/workService";

const AboutContextHarness = () => {
  const {
    setShowCreateDialog,
    setShowEditDialog,
    setShowDeleteDialog,
    setSelectedWorkResource,
    onSave,
  } = React.useContext(AboutContext);

  return (
    <>
      <Button onClick={() => setShowCreateDialog(true)}>Open Create</Button>
      <Button
        onClick={() =>
          onSave(
            {
              title: "Resource One",
              link: "https://example.com",
            },
            () => {
              return;
            },
          )
        }
      >
        Save Resource
      </Button>
      <Button
        onClick={() => {
          setSelectedWorkResource({
            id: 22,
            title: "Existing",
            link: "https://example.com/existing",
          } as any);
          setShowEditDialog(true);
        }}
      >
        Open Edit
      </Button>
      <Button
        onClick={() => {
          setSelectedWorkResource({
            id: 22,
            title: "Existing",
            link: "https://example.com/existing",
          } as any);
          setShowDeleteDialog(true);
        }}
      >
        Open Delete
      </Button>
    </>
  );
};

describe("AboutContext", () => {
  beforeEach(() => {
    cy.stub(workService, "getWorkResources")
      .as("getWorkResources")
      .resolves({
        status: 200,
        data: [{ id: 22, title: "Existing", link: "https://example.com" }],
      } as any);

    cy.stub(workService, "createWorkResource")
      .as("createWorkResource")
      .resolves({ status: 201, data: { id: 33 } } as any);

    cy.stub(workService, "updateWorkResource")
      .as("updateWorkResource")
      .resolves({ status: 200, data: { id: 22 } } as any);

    cy.stub(workService, "deleteWorkResource")
      .as("deleteWorkResource")
      .resolves({ status: 200 } as any);
  });

  it("loads work resources and creates a resource", () => {
    cy.mount(
      <Router initialEntries={["/track/work-plan?work_id=101"]}>
        <AboutProvider>
          <AboutContextHarness />
        </AboutProvider>
      </Router>,
    );

    cy.get("@getWorkResources").should("have.been.calledWith", 101);

    cy.contains("button", "Open Create").click();
    cy.contains("button", "Save Resource").click({ force: true });

    cy.get("@createWorkResource").should("have.been.called");
    cy.get("@getWorkResources").should("have.callCount", 2);
  });

  it("edits and deletes an existing resource", () => {
    cy.mount(
      <Router initialEntries={["/track/work-plan?work_id=101"]}>
        <AboutProvider>
          <AboutContextHarness />
        </AboutProvider>
      </Router>,
    );

    cy.contains("button", "Open Edit").click();
    cy.contains("button", "Save Resource").click({ force: true });

    cy.get("@updateWorkResource").should("have.been.calledWith", 22, {
      title: "Resource One",
      link: "https://example.com",
    });

    cy.contains("button", "Open Delete").click();
    cy.contains('[role="dialog"]', "Delete Resource?").within(() => {
      cy.contains("button", "Save").click({ force: true });
    });

    cy.get("@deleteWorkResource").should("have.been.calledWith", 22);
  });
});
