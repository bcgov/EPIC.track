import { faker } from "@faker-js/faker";
import { MemoryRouter as Router } from "react-router-dom";
import IssueCard from "../IssueCard";
import { defaultSearchOptions, MyIssuesContext } from "../MyIssuesContext";
import { StalenessEnum } from "constants/application-constant";
import { WorkIssueDashboardItem } from "models/Issue";

const value = {
  ...defaultSearchOptions,
  issues: [],
  loadingIssues: false,
  lazyLoadMoreIssues: () => {},
  totalIssues: 0,
  searchOptions: defaultSearchOptions,
  setSearchOptions: () => {},
  loadingMoreIssues: false,
  setLoadingMoreIssues: () => {},
  issueStalenessSettings: undefined,
  sortOrder: "desc",
  setSortOrder: () => {},
  refetchIssues: () => {},
  userWorkIds: [],
  isIssueDialogOpen: false,
  showIssueDialog: () => {},
  hideIssueDialog: () => {},
  selectedIssue: null,
};

const makeItem = (staleness?: StalenessEnum): WorkIssueDashboardItem => {
  return {
    work_id: faker.number.int(),
    work_name: faker.commerce.productName(),
    issue: {
      id: faker.number.int(),
      title: "Test issue",
      description: "Issue description",
      staleness,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updates: [
        {
          id: faker.number.int(),
          description: "Issue description",
          created_at: new Date().toISOString(),
        },
      ],
    },
  } as unknown as WorkIssueDashboardItem;
};

describe("IssueCard", () => {
  it("renders issue details when issue is provided", () => {
    const item = makeItem();
    cy.mount(
      <Router>
        <MyIssuesContext.Provider
          value={{ ...value, userWorkIds: [item.work_id] }}
        >
          <IssueCard item={item} />
        </MyIssuesContext.Provider>
      </Router>,
    );

    cy.contains("Test issue").should("exist");
    cy.contains("Issue description").should("exist");
    cy.contains(item.work_name).should("exist");
  });

  it("does not render staleness tooltip when issue is current", () => {
    const item = makeItem(StalenessEnum.WARN);
    cy.mount(
      <Router>
        <MyIssuesContext.Provider
          value={{ ...value, userWorkIds: [item.work_id] }}
        >
          <IssueCard item={item} />
        </MyIssuesContext.Provider>
      </Router>,
    );

    cy.findByLabelText("staleness level").should("not.exist");
  });

  it("mounts dialogs but keeps them closed initially", () => {
    const item = makeItem();
    cy.mount(
      <Router>
        <MyIssuesContext.Provider
          value={{ ...value, userWorkIds: [item.work_id] }}
        >
          <IssueCard item={item} />
        </MyIssuesContext.Provider>
      </Router>,
    );

    cy.contains("Edit Issue").should("not.exist");
    cy.contains("New Issue Update").should("not.exist");
    cy.contains("Edit Issue Update").should("not.exist");
  });
});
