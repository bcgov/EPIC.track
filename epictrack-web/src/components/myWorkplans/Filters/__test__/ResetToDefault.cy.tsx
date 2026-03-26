import React from "react";
import { ResetToDefault } from "components/myWorkplans/Filters/ResetToDefault";
import {
  MyWorkplansContext,
  workplanDefaultFilters,
} from "components/myWorkplans/MyWorkPlanContext";
import { MY_WORKPLAN_VIEW } from "components/myWorkplans/type";

describe("ResetToDefault", () => {
  it("resets filter fields to defaults while preserving other search options", () => {
    const setSearchOptions = cy.stub().as("setSearchOptions");

    cy.mount(
      <MyWorkplansContext.Provider
        value={{
          workplans: [],
          loadingWorkplans: false,
          lazyLoadMoreWorkplans: () => {},
          totalWorkplans: 0,
          searchOptions: {
            teams: ["A"],
            work_states: ["SUSPENDED"],
            regions: ["North"],
            project_types: ["Type1"],
            work_types: ["WT1"],
            text: "search text",
            staff_id: 99,
          },
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
        <ResetToDefault />
      </MyWorkplansContext.Provider>,
    );

    cy.contains("Reset").click();
    cy.get("@setSearchOptions").should("have.been.calledWith", {
      ...workplanDefaultFilters,
      staff_id: 99,
    });
  });
});
