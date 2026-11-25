import React from "react";
import dayjs from "dayjs";
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

  it("sends the picked day as a date with no time or timezone on create", () => {
    cy.stub(specialFieldService, "getEntries").resolves({
      status: 200,
      data: [],
    } as any);
    cy.stub(specialFieldService, "createSpecialFieldEntry")
      .as("create")
      .resolves({ status: 201 } as any);

    cy.mount(
      <SpecialFieldGrid
        entity={"work" as any}
        entity_id={99}
        fieldLabel="Name"
        fieldName="name"
        fieldType="text"
        fieldValueType="string"
        title="Special History"
        description={<span>d</span>}
      />,
      { reduxStore: makeStore() },
    );

    cy.contains("button", "New Entry").click();
    cy.get("input[name='name']").type("Brand New");
    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("button[aria-label='Save']").click({ force: true });

    cy.get("@create")
      .should("have.been.calledOnce")
      .its("firstCall.args.0.active_from")
      .should("equal", dayjs().format("YYYY-MM-DD"));
  });

  it("sends the stored day when a row is edited without touching the date", () => {
    cy.stub(specialFieldService, "getEntries").resolves({
      status: 200,
      data: [
        {
          id: 7,
          field_value: "Edit Me",
          // The instants are deliberately days away from the days the API reports:
          // the grid must use the API's days and never work one out from an instant.
          active_from: "2026-03-05T12:00:00+00:00",
          active_from_day: "2026-03-01",
          active_to: null,
          active_to_day: null,
        },
        {
          id: 6,
          field_value: "Older",
          active_from: "2026-01-15T12:00:00+00:00",
          active_from_day: "2026-01-10",
          active_to: "2026-03-03T12:00:00+00:00",
          active_to_day: "2026-02-28",
        },
      ],
    } as any);
    cy.stub(specialFieldService, "updateSpecialFieldEntry")
      .as("update")
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
        description={<span>d</span>}
      />,
      { reduxStore: makeStore() },
    );

    // The grid shows the days the API reports, whatever timezone the browser is in
    cy.contains("tr", "Edit Me").should("contain", "2026-03-01");
    cy.contains("tr", "Older")
      .should("contain", "2026-01-10")
      .and("contain", "2026-02-28");

    cy.contains("Edit Me")
      .parents("tr")
      .first()
      .find("button")
      .first()
      .click({ force: true });
    cy.get("input[name='active_from']").should("have.value", "2026-03-01");
    cy.get("input[name='name']").clear().type("Edited");
    cy.get("button[aria-label='Save']").click({ force: true });

    cy.get("@update")
      .should("have.been.calledOnce")
      .its("firstCall.args.0.active_from")
      .should("equal", "2026-03-01");
  });

  it("flags the value as required when the dropdown is cleared", () => {
    cy.stub(specialFieldService, "getEntries").resolves({
      status: 200,
      data: [
        {
          id: 3,
          field_value: "1",
          active_from: "2026-04-01T07:00:00+00:00",
          active_to: null,
        },
      ],
    } as any);
    cy.stub(specialFieldService, "updateSpecialFieldEntry")
      .as("update")
      .resolves({ status: 200 } as any);

    cy.mount(
      <SpecialFieldGrid
        entity={"work" as any}
        entity_id={55}
        fieldLabel="Decision"
        fieldName="decision"
        fieldType="select"
        fieldValueType="string"
        title="Decision History"
        description={<span>d</span>}
        options={[{ label: "Approved", value: "1" }]}
      />,
      { reduxStore: makeStore() },
    );

    cy.contains("Approved")
      .parents("tr")
      .first()
      .find("button")
      .first()
      .click({ force: true });
    // Clearing the dropdown used to throw; an uncaught error fails the test
    cy.get('[class*="indicatorContainer"]').first().click({ force: true });
    cy.get("button[aria-label='Save']").click({ force: true });

    cy.get("@update").should("not.have.been.called");
  });
});
