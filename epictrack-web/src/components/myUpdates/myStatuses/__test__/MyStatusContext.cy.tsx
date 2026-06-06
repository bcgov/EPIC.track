import React from "react";
import { Button } from "@mui/material";
import { MyStatusesContext, MyStatusesProvider } from "../MyStatusContext";
import { statusService } from "services/statusService/statusService";
import stalenessSettingsService from "services/stalenessSettingsService";
import { workService } from "services/workService/workService";

const MyStatusHarness = () => {
  const ctx = React.useContext(MyStatusesContext);

  return (
    <>
      <div data-cy="statuses-count">{ctx.statuses.length}</div>
      <div data-cy="statuses-total">{ctx.totalStatuses}</div>
      <div data-cy="loading-statuses">{String(ctx.loadingStatuses)}</div>
      <div data-cy="loading-more-statuses">
        {String(ctx.loadingMoreStatuses)}
      </div>
      <div data-cy="status-dialog-open">{String(ctx.isStatusDialogOpen)}</div>
      <div data-cy="selected-status-id">
        {ctx.selectedStatus?.status?.id ?? "none"}
      </div>
      <div data-cy="status-staleness-length">
        {ctx.statusStalenessSettings?.staleness_length ?? -1}
      </div>
      <div data-cy="status-user-work-ids">
        {(ctx.userWorkIds || []).join("|")}
      </div>
      <Button
        onClick={() =>
          ctx.showStatusDialog({
            status: {
              id: 55,
            },
          } as any)
        }
      >
        Open Status Dialog
      </Button>
      <Button onClick={() => ctx.hideStatusDialog()}>
        Close Status Dialog
      </Button>
      <Button onClick={() => ctx.lazyLoadMoreStatuses()}>
        Load More Statuses
      </Button>
      <Button onClick={() => ctx.refetchStatuses()}>Refetch Statuses</Button>
    </>
  );
};

describe("MyStatusContext", () => {
  beforeEach(() => {
    window.sessionStorage.removeItem("my-status-cached-search-options");
  });

  it("loads statuses, staleness settings, and supports pagination/modal controls", () => {
    cy.stub(statusService, "getAll")
      .as("getAllStatuses")
      .onFirstCall()
      .resolves({
        data: {
          items: [{ id: 1 }, { id: 2 }],
          total: 4,
        },
      } as any)
      .onSecondCall()
      .resolves({
        data: {
          items: [{ id: 3 }, { id: 4 }],
          total: 4,
        },
      } as any)
      .onThirdCall()
      .resolves({
        data: {
          items: [{ id: 9 }],
          total: 1,
        },
      } as any);

    cy.stub(stalenessSettingsService, "getStatusStaleness")
      .as("getStatusStaleness")
      .resolves({
        data: {
          staleness_length: 9,
          warning_length: 4,
        },
      } as any);

    cy.stub(workService, "getWorkIdsByStaff")
      .as("getWorkIdsByStaff")
      .resolves({
        data: [201, 202],
      } as any);

    cy.mount(
      <MyStatusesProvider>
        <MyStatusHarness />
      </MyStatusesProvider>,
    );

    cy.get("@getAllStatuses").should("have.been.called");
    cy.get("@getStatusStaleness").should("have.been.called");
    cy.get("@getWorkIdsByStaff").should("have.been.called");

    cy.get("[data-cy='statuses-count']").should("have.text", "2");
    cy.get("[data-cy='statuses-total']").should("have.text", "4");
    cy.get("[data-cy='loading-statuses']").should("have.text", "false");
    cy.get("[data-cy='status-staleness-length']").should("have.text", "9");
    cy.get("[data-cy='status-user-work-ids']").should("have.text", "201|202");

    cy.contains("button", "Open Status Dialog").click({ force: true });
    cy.get("[data-cy='status-dialog-open']").should("have.text", "true");
    cy.get("[data-cy='selected-status-id']").should("have.text", "55");

    cy.contains("button", "Close Status Dialog").click({ force: true });
    cy.get("[data-cy='status-dialog-open']").should("have.text", "false");
    cy.get("[data-cy='selected-status-id']").should("have.text", "none");

    cy.contains("button", "Load More Statuses").click({ force: true });
    cy.get("[data-cy='loading-more-statuses']").should("have.text", "false");
    cy.get("[data-cy='statuses-count']").should("have.text", "4");

    cy.contains("button", "Refetch Statuses").click({ force: true });
    cy.get("[data-cy='statuses-count']").should("have.text", "1");
    cy.get("@getAllStatuses").should("have.callCount", 3);
  });

  it("shows notifications when status, work ids, and staleness fetches fail", () => {
    cy.stub(statusService, "getAll")
      .as("getAllStatuses")
      .resolves({ data: {} } as any);

    cy.stub(stalenessSettingsService, "getStatusStaleness")
      .as("getStatusStaleness")
      .rejects(new Error("staleness failed"));

    cy.stub(workService, "getWorkIdsByStaff")
      .as("getWorkIdsByStaff")
      .resolves({ data: null } as any);

    cy.mount(
      <MyStatusesProvider>
        <MyStatusHarness />
      </MyStatusesProvider>,
    );

    cy.contains("Could not load Staleness settings").should("exist");
    cy.contains("Could not load user's Works").should("exist");
    cy.contains("Error during processing the request").should("exist");
    cy.get("[data-cy='loading-statuses']").should("have.text", "false");
  });

  it("exposes safe default handlers outside provider", () => {
    const DefaultStatusesHarness = () => {
      const ctx = React.useContext(MyStatusesContext);

      React.useEffect(() => {
        ctx.lazyLoadMoreStatuses();
        ctx.setSearchOptions((prev: any) => prev);
        ctx.setLoadingMoreStatuses(true);
        ctx.setSortOrder("asc");
        ctx.refetchStatuses();
        ctx.showStatusDialog();
        ctx.hideStatusDialog();
      }, [ctx]);

      return <div data-cy="default-status-context">{ctx.totalStatuses}</div>;
    };

    cy.mount(<DefaultStatusesHarness />);
    cy.get("[data-cy='default-status-context']").should("have.text", "0");
  });
});
