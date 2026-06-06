import { mount } from "cypress/react";
import Filters from "../Filters";
import { MyIssuesContext } from "../MyIssuesContext";
import { issuesContextValue } from "../../../../../cypress/support/common";
import * as projectService from "services/projectService/projectService";

describe("My Issues Filters", () => {
  it("renders all filter components", () => {
    mount(
      <MyIssuesContext.Provider value={issuesContextValue}>
        <Filters />
      </MyIssuesContext.Provider>,
    );

    // Assert that each filter renders
    cy.findByPlaceholderText("Search for a Project").should("exist"); // ProjectNameFitler
    cy.contains("State").should("exist"); // IssueStateFilter
    cy.contains("Approval").should("exist"); // ApprovedFilter
    cy.contains("Work Type").should("exist"); // WorkTypeFilter
    cy.contains("Team").should("exist"); // TeamFilter
    cy.contains("Region").should("exist"); // EnvRegionFilter
    cy.contains("Staleness").should("exist"); // StalenessFilter
    cy.contains("Date Updated").should("exist"); // SortBy
  });

  it("calls setSearchOptions when a filter changes", () => {
    const mockSetSearchOptions = cy.stub().as("setSearchOptions");
    const mockSetSortOrder = cy.stub().as("setSortOrder");

    cy.stub(projectService.projectService, "getAll").resolves({
      data: [
        { id: 1, name: "Project A" },
        { id: 2, name: "Project B" },
      ],
    });

    mount(
      <MyIssuesContext.Provider
        value={{
          ...issuesContextValue,
          setSearchOptions: mockSetSearchOptions,
          sortOrder: "asc",
          setSortOrder: mockSetSortOrder,
        }}
      >
        <Filters />
      </MyIssuesContext.Provider>,
    );

    cy.findByPlaceholderText("Search for a Project")
      .should("not.be.disabled")
      .type("Project A");

    cy.contains("Project A").click();

    cy.get("@setSearchOptions").then(() => {
      cy.wrap(mockSetSearchOptions).then((stub) => {
        const lastCallArg = stub.lastCall.args[0];
        const result =
          typeof lastCallArg === "function" ? lastCallArg({}) : lastCallArg;
        expect(result).to.have.property("text", "Project A");
      });
    });
  });
});
