import React, { useContext } from "react";
import { configureStore } from "@reduxjs/toolkit";
import {
  SpecialHistoryContext,
  SpecialHistoryProvider,
} from "components/settings/tabs/SpecialHistory/SpecialHistorySettingsContext";
import { ministryService } from "services/ministryService";
import staffService from "services/staffService/staffService";
import specialFieldService from "services/specialFieldService";

const makeStore = (roles: string[] = []) => {
  const state = {
    user: {
      userDetail: {
        roles,
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

const Harness = () => {
  const context = useContext(SpecialHistoryContext);

  return (
    <div>
      <div data-cy="dialog-open">
        {String(context.createMinistryDialogOpen)}
      </div>
      <div data-cy="ministries-count">{context.ministries.length}</div>
      <div data-cy="ministers-count">{context.allMinisters.length}</div>
      <div data-cy="selected-ministry">{context.ministry?.id || ""}</div>
      <button
        data-cy="open-dialog"
        onClick={() => context.setCreateMinistryDialogOpen(true)}
      >
        open
      </button>
      <button
        data-cy="select-ministry"
        onClick={() =>
          context.setMinistry((context.ministries[0] as any) || null)
        }
      >
        select
      </button>
      <button
        data-cy="save"
        onClick={() => context.onSave({ name: "Name" }, () => {})}
      >
        save
      </button>
    </div>
  );
};

describe("SpecialHistoryProvider", () => {
  beforeEach(() => {
    cy.stub(specialFieldService, "getEntriesBasedOnFieldValue").resolves({
      status: 200,
      data: [{ entity_id: 1 }, { entity_id: 3 }],
    } as any);

    cy.stub(staffService, "getAll").resolves({
      status: 200,
      data: [
        { id: 1, full_name: "A Minister" },
        { id: 2, full_name: "Not Minister" },
        { id: 3, full_name: "B Minister" },
      ],
    } as any);

    cy.stub(ministryService, "getAll").resolves({
      status: 200,
      data: [
        {
          id: 10,
          name: "Energy",
          minister: { full_name: "A Minister" },
          date_created: "2026-01-01",
          date_closed: null,
        },
      ],
    } as any);
  });

  it("loads ministries and previous ministers on mount", () => {
    cy.mount(
      <SpecialHistoryProvider>
        <Harness />
      </SpecialHistoryProvider>,
      { reduxStore: makeStore() },
    );

    cy.get("[data-cy='ministries-count']").contains("1");
    cy.get("[data-cy='ministers-count']").contains("2");
  });

  it("uses create path when no ministry is selected", () => {
    cy.stub(ministryService, "create")
      .as("create")
      .resolves({ status: 201 } as any);
    cy.stub(ministryService, "update")
      .as("update")
      .resolves({ status: 200 } as any);

    cy.mount(
      <SpecialHistoryProvider>
        <Harness />
      </SpecialHistoryProvider>,
      { reduxStore: makeStore() },
    );

    cy.get("[data-cy='save']").click();

    cy.get("@create").should("have.been.calledWith", { name: "Name" });
    cy.get("@update").should("not.have.been.called");
    cy.get("[data-cy='dialog-open']").contains("false");
    cy.wrap(ministryService.getAll).its("callCount").should("be.gte", 2);
  });

  it("uses update path when a ministry is selected", () => {
    cy.stub(ministryService, "create")
      .as("create")
      .resolves({ status: 201 } as any);
    cy.stub(ministryService, "update")
      .as("update")
      .resolves({ status: 200 } as any);

    cy.mount(
      <SpecialHistoryProvider>
        <Harness />
      </SpecialHistoryProvider>,
      { reduxStore: makeStore() },
    );

    cy.get("[data-cy='select-ministry']").click();
    cy.get("[data-cy='selected-ministry']").contains("10");

    cy.get("[data-cy='save']").click();

    cy.get("@update").should("have.been.calledWith", { name: "Name" }, 10);
    cy.get("@create").should("not.have.been.called");
    cy.get("[data-cy='selected-ministry']").should("have.text", "");
  });
});
