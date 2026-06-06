import { Toolbar } from "../Toolbar";
import { MyWorkplansContext, defaultSearchOptions } from "../MyWorkPlanContext";
import { MY_WORKPLAN_VIEW } from "../type";

describe("MyWorkplans Toolbar", () => {
  it("renders and switches between card and gantt views", () => {
    const setMyWorkPlanView = cy.stub().as("setMyWorkPlanView");

    cy.mount(
      <MyWorkplansContext.Provider
        value={{
          workplans: [],
          loadingWorkplans: false,
          lazyLoadMoreWorkplans: () => {
            return;
          },
          totalWorkplans: 3,
          searchOptions: { ...defaultSearchOptions, staff_id: 1 },
          setSearchOptions: () => {
            return;
          },
          statusStalenessSettings: undefined,
          loadingMoreWorkplans: false,
          setLoadingMoreWorkplans: () => {
            return;
          },
          myWorkPlanView: MY_WORKPLAN_VIEW.CARDS,
          setMyWorkPlanView,
          sortOrder: "desc",
          setSortOrder: () => {
            return;
          },
        }}
      >
        <Toolbar />
      </MyWorkplansContext.Provider>,
    );

    cy.contains("Workplans").should("exist");

    cy.get("button.MuiIconButton-root").first().click();
    cy.get("@setMyWorkPlanView").should("have.been.calledWith", "Cards");

    cy.get("button.MuiIconButton-root").last().click();
    cy.get("@setMyWorkPlanView").should("have.been.calledWith", "Gantt");
  });
});
