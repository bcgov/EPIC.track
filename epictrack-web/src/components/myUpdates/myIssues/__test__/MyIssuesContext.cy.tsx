import React from "react";
import { Button } from "@mui/material";
import { MyIssuesContext, MyIssuesProvider } from "../MyIssuesContext";
import { issueService } from "services/issueService";
import stalenessSettingsService from "services/stalenessSettingsService";
import { workService } from "services/workService/workService";

const MyIssuesHarness = () => {
  const ctx = React.useContext(MyIssuesContext);

  return (
    <>
      <div data-cy="issues-count">{ctx.issues.length}</div>
      <div data-cy="issues-total">{ctx.totalIssues}</div>
      <div data-cy="loading-issues">{String(ctx.loadingIssues)}</div>
      <div data-cy="loading-more-issues">{String(ctx.loadingMoreIssues)}</div>
      <div data-cy="issue-dialog-open">{String(ctx.isIssueDialogOpen)}</div>
      <div data-cy="selected-issue-id">{ctx.selectedIssue?.id ?? "none"}</div>
      <div data-cy="issue-staleness-length">
        {ctx.issueStalenessSettings?.staleness_length ?? -1}
      </div>
      <div data-cy="user-work-ids">{(ctx.userWorkIds || []).join("|")}</div>
      <Button
        onClick={() =>
          ctx.showIssueDialog({
            id: 99,
            issue: {
              id: 99,
            },
          } as any)
        }
      >
        Open Issue Dialog
      </Button>
      <Button onClick={() => ctx.hideIssueDialog()}>Close Issue Dialog</Button>
      <Button onClick={() => ctx.lazyLoadMoreIssues()}>Load More Issues</Button>
      <Button onClick={() => ctx.refetchIssues()}>Refetch Issues</Button>
    </>
  );
};

describe("MyIssuesContext", () => {
  beforeEach(() => {
    window.sessionStorage.removeItem("my-issues-cached-search-options");
  });

  it("loads issues data, staleness settings, and supports pagination/modal controls", () => {
    cy.stub(issueService, "getAll")
      .as("getAllIssues")
      .onFirstCall()
      .resolves({
        data: {
          items: [{ id: 1 }, { id: 2 }],
          total: 3,
        },
      } as any)
      .onSecondCall()
      .resolves({
        data: {
          items: [{ id: 3 }],
          total: 3,
        },
      } as any)
      .onThirdCall()
      .resolves({
        data: {
          items: [{ id: 4 }],
          total: 1,
        },
      } as any);

    cy.stub(stalenessSettingsService, "getIssueStaleness")
      .as("getIssueStaleness")
      .resolves({
        data: {
          staleness_length: 7,
          warning_length: 3,
        },
      } as any);

    cy.stub(workService, "getWorkIdsByStaff")
      .as("getWorkIdsByStaff")
      .resolves({
        data: [101, 102],
      } as any);

    cy.mount(
      <MyIssuesProvider>
        <MyIssuesHarness />
      </MyIssuesProvider>,
    );

    cy.get("@getAllIssues").should("have.been.called");
    cy.get("@getIssueStaleness").should("have.been.called");
    cy.get("@getWorkIdsByStaff").should("have.been.called");

    cy.get("[data-cy='issues-count']").should("have.text", "2");
    cy.get("[data-cy='issues-total']").should("have.text", "3");
    cy.get("[data-cy='loading-issues']").should("have.text", "false");
    cy.get("[data-cy='issue-staleness-length']").should("have.text", "7");
    cy.get("[data-cy='user-work-ids']").should("have.text", "101|102");

    cy.contains("button", "Open Issue Dialog").click({ force: true });
    cy.get("[data-cy='issue-dialog-open']").should("have.text", "true");
    cy.get("[data-cy='selected-issue-id']").should("have.text", "99");

    cy.contains("button", "Close Issue Dialog").click({ force: true });
    cy.get("[data-cy='issue-dialog-open']").should("have.text", "false");
    cy.get("[data-cy='selected-issue-id']").should("have.text", "none");

    cy.contains("button", "Load More Issues").click({ force: true });
    cy.get("[data-cy='loading-more-issues']").should("have.text", "false");
    cy.get("[data-cy='issues-count']").should("have.text", "3");

    cy.contains("button", "Refetch Issues").click({ force: true });
    cy.get("[data-cy='issues-count']").should("have.text", "1");
    cy.get("@getAllIssues").should("have.callCount", 3);
  });

  it("shows notifications when issue, work ids, and staleness fetches fail", () => {
    cy.stub(issueService, "getAll")
      .as("getAllIssues")
      .resolves({ data: {} } as any);

    cy.stub(stalenessSettingsService, "getIssueStaleness")
      .as("getIssueStaleness")
      .rejects(new Error("staleness failed"));

    cy.stub(workService, "getWorkIdsByStaff")
      .as("getWorkIdsByStaff")
      .resolves({ data: null } as any);

    cy.mount(
      <MyIssuesProvider>
        <MyIssuesHarness />
      </MyIssuesProvider>,
    );

    cy.contains("Could not load Staleness settings").should("exist");
    cy.contains("Could not load user's Works").should("exist");
    cy.contains("Error during processing the request").should("exist");
    cy.get("[data-cy='loading-issues']").should("have.text", "false");
  });

  it("exposes safe default handlers outside provider", () => {
    const DefaultIssuesHarness = () => {
      const ctx = React.useContext(MyIssuesContext);

      React.useEffect(() => {
        ctx.lazyLoadMoreIssues();
        ctx.setSearchOptions((prev: any) => prev);
        ctx.setLoadingMoreIssues(true);
        ctx.setSortOrder("asc");
        ctx.refetchIssues();
        ctx.showIssueDialog();
        ctx.hideIssueDialog();
      }, [ctx]);

      return <div data-cy="default-issues-context">{ctx.totalIssues}</div>;
    };

    cy.mount(<DefaultIssuesHarness />);
    cy.get("[data-cy='default-issues-context']").should("have.text", "0");
  });
});
