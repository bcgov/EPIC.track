import React, { useState } from "react";
import { WorkStateFilter } from "components/myWorkplans/Filters/WorkStateFilter";
import {
  MyWorkplansContext,
  defaultSearchOptions,
  WorkPlanSearchOptions,
} from "components/myWorkplans/MyWorkPlanContext";
import { MY_WORKPLAN_VIEW } from "components/myWorkplans/type";

const Harness = () => {
  const [searchOptions, setSearchOptions] = useState<WorkPlanSearchOptions>({
    ...defaultSearchOptions,
  });

  return (
    <MyWorkplansContext.Provider
      value={{
        workplans: [],
        loadingWorkplans: false,
        lazyLoadMoreWorkplans: () => {},
        totalWorkplans: 0,
        searchOptions,
        setSearchOptions,
        statusStalenessSettings: undefined,
        loadingMoreWorkplans: false,
        setLoadingMoreWorkplans: () => {},
        myWorkPlanView: MY_WORKPLAN_VIEW.CARDS,
        setMyWorkPlanView: () => {},
        sortOrder: "desc",
        setSortOrder: () => {},
      }}
    >
      <WorkStateFilter />
      <div data-cy="states">
        {searchOptions.work_states.join(",") || "EMPTY"}
      </div>
    </MyWorkplansContext.Provider>
  );
};

describe("WorkStateFilter", () => {
  it("applies selected work states", () => {
    cy.mount(<Harness />);

    cy.get("[data-cy='states']").contains("IN_PROGRESS");

    cy.get("input").first().click({ force: true });
    cy.contains("Suspended").click({ force: true });
    cy.contains("Apply").click({ force: true });

    cy.get("[data-cy='states']").should("contain.text", "SUSPENDED");
  });

  it("clears applied work states", () => {
    cy.mount(<Harness />);

    cy.get("input").first().click({ force: true });
    cy.contains("Clear Filters").click({ force: true });

    cy.get("[data-cy='states']").should("have.text", "EMPTY");
  });
});
