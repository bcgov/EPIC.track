import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { SpecialFieldGrid } from "components/shared/specialField";
import specialFieldService from "services/specialFieldService";

const makeStore = () => {
  const state = {
    user: {
      userDetail: {
        roles: ["extended_edit"],
      },
    },
    uiState: {},
    loadingState: {},
  };

  return configureStore({
    reducer: () => state,
    preloadedState: state,
  });
};

describe("SpecialFieldGrid", () => {
  it("renders text mode grid and existing row values", () => {
    cy.stub(specialFieldService, "getEntries").resolves({
      status: 200,
      data: [
        {
          id: 1,
          entity: "work",
          entity_id: 99,
          field_name: "name",
          field_value: "Legacy Name",
          active_from: "2026-03-01",
          active_to: null,
        },
      ],
    } as any);

    cy.mount(
      <SpecialFieldGrid
        entity={"work" as any}
        entity_id={99}
        fieldLabel="Name"
        fieldName="name"
        fieldType="text"
        fieldValueType="string"
        title="Special History"
        description={<span>Track custom field history</span>}
      />,
    );

    cy.get("[data-cy='title']").contains("Special History");
    cy.get("[data-cy='description']").contains("Track custom field history");
    cy.contains("button", "New Entry").should("exist");
    cy.contains("Legacy Name").should("exist");
    cy.contains("Today").should("exist");
  });

  it("renders select mode labels from options", () => {
    cy.stub(specialFieldService, "getEntries").resolves({
      status: 200,
      data: [
        {
          id: 2,
          entity: "work",
          entity_id: 55,
          field_name: "decision",
          field_value: "1",
          active_from: "2026-04-01",
          active_to: "2026-04-20",
        },
      ],
    } as any);

    cy.mount(
      <SpecialFieldGrid
        entity={"work" as any}
        entity_id={55}
        fieldLabel="Decision"
        fieldName="decision"
        fieldType="select"
        fieldValueType="string"
        title="Decision History"
        description={<span>Decision tracking</span>}
        options={[{ label: "Approved", value: "1" }]}
      />,
    );

    cy.contains("Decision History").should("exist");
    cy.contains("Approved").should("exist");
  });

  it("deletes an existing entry from the history", () => {
    const onSave = cy.stub().as("onSave");

    cy.stub(specialFieldService, "getEntries")
      .onFirstCall()
      .resolves({
        status: 200,
        data: [
          {
            id: 12,
            entity: "work",
            entity_id: 99,
            field_name: "name",
            field_value: "Delete Me",
            active_from: "2026-03-01",
            active_to: null,
          },
        ],
      } as any)
      .onSecondCall()
      .resolves({ status: 200, data: [] } as any);
    cy.stub(specialFieldService, "deleteSpecialFieldEntry")
      .as("deleteSpecialFieldEntry")
      .resolves({ status: 200 } as any);

    cy.mount(
      <SpecialFieldGrid
        entity={"work" as any}
        entity_id={99}
        fieldLabel="Name"
        fieldName="name"
        fieldType="text"
        fieldValueType="string"
        title="Special History"
        description={<span>Track custom field history</span>}
        onSave={onSave}
      />,
      { reduxStore: makeStore() },
    );

    cy.contains("Delete Me")
      .parents("tr")
      .first()
      .find("button")
      .last()
      .click({ force: true });

    cy.contains('[role="dialog"]', "Delete Entry?").within(() => {
      cy.contains("button", "Delete").click({ force: true });
    });

    cy.get("@deleteSpecialFieldEntry").should("have.been.calledWith", 12);
    cy.get("@onSave").should("have.been.called");
  });

  it("closes delete dialog when cancel is clicked", () => {
    cy.stub(specialFieldService, "getEntries").resolves({
      status: 200,
      data: [
        {
          id: 12,
          entity: "work",
          entity_id: 99,
          field_name: "name",
          field_value: "Delete Me",
          active_from: "2026-03-01",
          active_to: null,
        },
      ],
    } as any);
    cy.stub(specialFieldService, "deleteSpecialFieldEntry")
      .as("deleteSpecialFieldEntry")
      .resolves({ status: 200 } as any);

    cy.mount(
      <SpecialFieldGrid
        entity={"work" as any}
        entity_id={99}
        fieldLabel="Name"
        fieldName="name"
        fieldType="text"
        fieldValueType="string"
        title="Special History"
        description={<span>Track custom field history</span>}
      />,
      { reduxStore: makeStore() },
    );

    cy.contains("Delete Me")
      .parents("tr")
      .first()
      .find("button")
      .last()
      .click({ force: true });

    cy.contains('[role="dialog"]', "Delete Entry?").within(() => {
      cy.contains("button", "Cancel").click({ force: true });
    });

    cy.contains('[role="dialog"]', "Delete Entry?").should("not.exist");
    cy.get("@deleteSpecialFieldEntry").should("not.have.been.called");
  });
});
