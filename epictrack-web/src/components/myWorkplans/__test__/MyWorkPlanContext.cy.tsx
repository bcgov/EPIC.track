import React, { useContext } from "react";
import { configureStore } from "@reduxjs/toolkit";
import {
  MyWorkplansContext,
  MyWorkplansProvider,
} from "components/myWorkplans/MyWorkPlanContext";
import { workplanService } from "services/workplanService";
import stalenessSettingsService from "services/stalenessSettingsService";

const makeStore = () => {
  const state = {
    user: {
      userDetail: {
        staffId: 99,
        email: "owner@gov.bc.ca",
        roles: [],
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
  const context = useContext(MyWorkplansContext);

  return (
    <div>
      <div data-cy="count">{context.workplans.length}</div>
      <div data-cy="total">{context.totalWorkplans}</div>
      <div data-cy="loading">{String(context.loadingWorkplans)}</div>
      <button
        data-cy="load-more"
        onClick={() => context.lazyLoadMoreWorkplans()}
      >
        load more
      </button>
    </div>
  );
};

describe("MyWorkplansProvider", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("loads initial workplans and appends more via lazy loading", () => {
    cy.stub(stalenessSettingsService, "getStatusStaleness").resolves({
      data: { id: "status" },
    } as any);

    cy.stub(workplanService, "getAll")
      .onFirstCall()
      .resolves({
        data: {
          items: [{ id: 1, title: "WP 1" }],
          total: 2,
        },
      } as any)
      .onSecondCall()
      .resolves({
        data: {
          items: [{ id: 2, title: "WP 2" }],
          total: 2,
        },
      } as any);

    cy.mount(
      <MyWorkplansProvider>
        <Harness />
      </MyWorkplansProvider>,
      { reduxStore: makeStore() },
    );

    cy.get("[data-cy='count']").contains("1");
    cy.get("[data-cy='total']").contains("2");

    cy.get("[data-cy='load-more']").click();

    cy.get("[data-cy='count']").contains("2");
    cy.wrap(workplanService.getAll).should("have.been.calledWith", 2, 12);
  });

  it("shows notification when workplan response has no data", () => {
    cy.stub(stalenessSettingsService, "getStatusStaleness").resolves({
      data: { id: "status" },
    } as any);

    cy.stub(workplanService, "getAll").resolves(undefined as any);
    cy.mount(
      <MyWorkplansProvider>
        <Harness />
      </MyWorkplansProvider>,
      { reduxStore: makeStore() },
    );

    cy.get("[data-cy='count']").contains("0");
    cy.get("[data-cy='total']").contains("0");
    cy.get("[data-cy='loading']").contains("false");
  });

  it("stops loading when loading workplans throws", () => {
    cy.stub(stalenessSettingsService, "getStatusStaleness").resolves({
      data: { id: "status" },
    } as any);

    cy.stub(workplanService, "getAll").rejects(new Error("boom"));
    cy.mount(
      <MyWorkplansProvider>
        <Harness />
      </MyWorkplansProvider>,
      { reduxStore: makeStore() },
    );

    cy.get("[data-cy='loading']").contains("false");
    cy.get("[data-cy='count']").contains("0");
  });
});
