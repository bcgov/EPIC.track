import React, { useState } from "react";
import { SortByFilter } from "components/myWorkplans/Filters/SortByFilter";
import {
  MyWorkplansContext,
  defaultSearchOptions,
} from "components/myWorkplans/MyWorkPlanContext";
import { MY_WORKPLAN_VIEW } from "components/myWorkplans/type";

const Harness = () => {
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortKey, setSortKey] = useState("start_date");

  return (
    <MyWorkplansContext.Provider
      value={{
        workplans: [],
        loadingWorkplans: false,
        lazyLoadMoreWorkplans: () => {},
        totalWorkplans: 0,
        searchOptions: defaultSearchOptions,
        setSearchOptions: () => {},
        statusStalenessSettings: undefined,
        loadingMoreWorkplans: false,
        setLoadingMoreWorkplans: () => {},
        myWorkPlanView: MY_WORKPLAN_VIEW.CARDS,
        setMyWorkPlanView: () => {},
        sortOrder,
        setSortOrder,
        sortKey,
        setSortKey,
      }}
    >
      <SortByFilter />
      <div data-cy="sort">{`${sortKey}:${sortOrder}`}</div>
    </MyWorkplansContext.Provider>
  );
};

describe("SortByFilter", () => {
  it("defaults to start date, newest first", () => {
    cy.mount(<Harness />);

    cy.get("[data-cy='sort-by-select']").should("contain.text", "Start Date");
    cy.get("[data-cy='sort']").should("have.text", "start_date:desc");

    cy.get("[data-cy='sort-by-select']").click();
    cy.get("[role='listbox']").within(() => {
      cy.contains("Sort by");
      cy.contains("Alphabetical");
      cy.contains("Order");
      cy.contains("Newest first");
      cy.contains("Oldest first");
    });
  });

  it("switches to alphabetical A to Z and toggles order", () => {
    cy.mount(<Harness />);

    cy.get("[data-cy='sort-by-select']").click();
    cy.contains("li", "Alphabetical").click();

    cy.get("[data-cy='sort-by-select']").should("contain.text", "Alphabetical");
    cy.get("[data-cy='sort']").should("have.text", "name:asc");

    cy.get("[data-cy='sort-by-select']").click();
    cy.get("[role='listbox']").should("not.contain.text", "Newest first");
    cy.contains("li", "Z to A").click();

    cy.get("[data-cy='sort']").should("have.text", "name:desc");
  });

  it("switches back to start date newest first", () => {
    cy.mount(<Harness />);

    cy.get("[data-cy='sort-by-select']").click();
    cy.contains("li", "Alphabetical").click();
    cy.get("[data-cy='sort-by-select']").click();
    cy.contains("li", "Start Date").click();

    cy.get("[data-cy='sort']").should("have.text", "start_date:desc");
  });
});
