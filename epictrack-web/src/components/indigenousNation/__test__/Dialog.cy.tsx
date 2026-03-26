import React from "react";
import { FirstNationDialog } from "components/indigenousNation/Dialog";
import indigenousNationService from "services/indigenousNationService/indigenousNationService";
import staffService from "services/staffService/staffService";
import { pipOrgTypeService } from "services/pipOrgTypeService";

describe("FirstNationDialog", () => {
  beforeEach(() => {
    cy.stub(staffService, "getAll").resolves({ status: 200, data: [] } as any);
    cy.stub(pipOrgTypeService, "getAll").resolves({
      status: 200,
      data: [],
    } as any);
    cy.stub(indigenousNationService, "checkIndigenousNationExists").resolves({
      data: { exists: false },
    } as any);
  });

  it("loads existing nation and submits update", () => {
    const setOpen = cy.stub().as("setOpen");
    const saveFirstNationCallback = cy.stub().as("saved");

    cy.stub(indigenousNationService, "getById")
      .as("getById")
      .resolves({
        data: {
          id: 8,
          name: "Nation One",
          relationship_holder_id: null,
          pip_org_type_id: null,
          pip_link: "",
          is_active: true,
          notes: "",
        },
      } as any);
    cy.stub(indigenousNationService, "update")
      .as("update")
      .resolves({
        status: 200,
      } as any);

    cy.mount(
      <FirstNationDialog
        firstNationId={8}
        open={true}
        setOpen={setOpen}
        saveFirstNationCallback={saveFirstNationCallback}
      />,
    );

    cy.get("@getById").should("have.been.calledWith", "8");
    cy.contains("Nation One").should("exist");

    cy.get('input[placeholder="Name"]').clear().type("Nation One Updated");
    cy.get("#first-nation-form").submit();

    cy.get("@update").should("have.been.called");
    cy.get("@setOpen").should("have.been.calledWith", false);
    cy.get("@saved").should("have.been.called");
  });

  it("submits create flow when id is not provided", () => {
    const setOpen = cy.stub().as("setOpen");
    const saveFirstNationCallback = cy.stub().as("saved");

    cy.stub(indigenousNationService, "create")
      .as("create")
      .resolves({
        status: 201,
      } as any);

    cy.mount(
      <FirstNationDialog
        open={true}
        setOpen={setOpen}
        saveFirstNationCallback={saveFirstNationCallback}
      />,
    );

    cy.contains("Create First Nation").should("exist");

    cy.get('input[placeholder="Name"]').type("Nation Two");
    cy.get("#first-nation-form").submit();

    cy.get("@create").should("have.been.called");
    cy.get("@setOpen").should("have.been.calledWith", false);
    cy.get("@saved").should("have.been.called");
  });
});
