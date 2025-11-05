import { MemoryRouter as Router } from "react-router-dom";
import StatusCard from "../StatusCard";
import { MyStatusesContext, defaultSearchOptions } from "../MyStatusContext";
import { StalenessEnum } from "constants/application-constant";
import { faker } from "@faker-js/faker";
import { StatusDashboardItem } from "models/status";

const value = {
  ...defaultSearchOptions,
  statuses: [],
  loadingStatuses: false,
  lazyLoadMoreStatuses: () => {},
  totalStatuses: 0,
  searchOptions: defaultSearchOptions,
  setSearchOptions: () => {},
  loadingMoreStatuses: false,
  setLoadingMoreStatuses: () => {},
  statusStalenessSettings: undefined,
  sortOrder: "desc",
  setSortOrder: () => {},
  refetchStatuses: () => {},
  userWorkIds: [],
  isStatusDialogOpen: false,
  showStatusDialog: () => {},
  hideStatusDialog: () => {},
  selectedStatus: null,
};

const makeItem = (staleness?: StalenessEnum): StatusDashboardItem => {
  const status = {
    id: faker.number.int(),
    description: "Test status",
    posted_date: new Date().toISOString(),
    is_active: true,
    is_approved: true,
    approved_date: new Date().toISOString(),
    staleness,
  };
  return {
    project_is_active: true,
    project_name: faker.company.name(),
    work_id: faker.number.int(),
    work_is_active: true,
    work_name: faker.commerce.productName(),
    work_type: "EA",
    status,
    status_history: [status],
  };
};

describe("StatusCard", () => {
  it("renders correctly when status is null", () => {
    const item = { ...makeItem(), status: null, status_history: [] };
    cy.mount(
      <Router>
        <MyStatusesContext.Provider
          value={{ ...value, userWorkIds: [item.work_id] }}
        >
          <StatusCard item={item} />
        </MyStatusesContext.Provider>
      </Router>,
    );

    cy.contains("You don't have any Status yet").should("exist");
  });

  it("renders status and shows WARN staleness icon", () => {
    const item = makeItem(StalenessEnum.WARN);
    cy.mount(
      <Router>
        <MyStatusesContext.Provider
          value={{ ...value, userWorkIds: [item.work_id] }}
        >
          <StatusCard item={item} />
        </MyStatusesContext.Provider>
      </Router>,
    );

    // RecentStatus renders description
    cy.contains("Test status").should("exist");

    // Hover staleness icon
    cy.findByLabelText("staleness level").trigger("mouseover", { force: true });
    cy.get('[role="tooltip"]')
      .should("be.visible")
      .and("contain.text", "This work status is almost out of date.");
  });

  it("renders CRITICAL staleness tooltip", () => {
    const item = makeItem(StalenessEnum.CRITICAL);
    cy.mount(
      <Router>
        <MyStatusesContext.Provider
          value={{ ...value, userWorkIds: [item.work_id] }}
        >
          <StatusCard item={item} />
        </MyStatusesContext.Provider>
      </Router>,
    );

    cy.findByLabelText("staleness level").trigger("mouseover", { force: true });
    cy.get('[role="tooltip"]')
      .should("be.visible")
      .and("contain.text", "This work status is out of date.");
  });
});
