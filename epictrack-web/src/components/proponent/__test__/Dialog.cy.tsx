import React from "react";
import { ProponentDialog } from "components/proponent/Dialog";
import proponentService from "services/proponentService/proponentService";
import staffService from "services/staffService/staffService";

describe("ProponentDialog", () => {
  beforeEach(() => {
    cy.stub(staffService, "getAll").resolves({ status: 200, data: [] } as any);
    cy.stub(proponentService, "checkProponentExists").resolves({
      data: { exists: false },
    } as any);
  });

  it("loads existing proponent and updates it", () => {
    const setOpen = cy.stub().as("setOpen");
    const saveProponentCallback = cy.stub().as("saved");

    cy.stub(proponentService, "getById")
      .as("getById")
      .resolves({
        data: {
          id: 9,
          name: undefined,
          relationship_holder_id: null,
          is_active: true,
        },
      } as any);
    cy.stub(proponentService, "update")
      .as("update")
      .resolves({
        status: 200,
      } as any);

    cy.mount(
      <ProponentDialog
        proponentId={9}
        open={true}
        setOpen={setOpen}
        saveProponentCallback={saveProponentCallback}
      />,
    );

    cy.get("@getById").should("have.been.calledWith", "9");
    cy.contains("Edit Proponent").should("exist");
    cy.get('input[placeholder="Proponent Name"]').type("Proponent One Updated");
    cy.get("#proponent-form").submit();

    cy.get("@update").should("have.been.called");
    cy.get("@setOpen").should("have.been.calledWith", false);
    cy.get("@saved").should("have.been.called");
  });

  it("creates a new proponent when id is not provided", () => {
    const setOpen = cy.stub().as("setOpen");
    const saveProponentCallback = cy.stub().as("saved");

    cy.stub(proponentService, "create")
      .as("create")
      .resolves({
        status: 201,
      } as any);

    cy.mount(
      <ProponentDialog
        open={true}
        setOpen={setOpen}
        saveProponentCallback={saveProponentCallback}
      />,
    );

    cy.contains("Create Proponent").should("exist");

    cy.get('input[placeholder="Proponent Name"]').type("Proponent Two");
    cy.get("#proponent-form").submit();

    cy.get("@create").should("have.been.called");
    cy.get("@setOpen").should("have.been.calledWith", false);
    cy.get("@saved").should("have.been.called");
  });
});
