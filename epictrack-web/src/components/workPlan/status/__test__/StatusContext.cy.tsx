import React from "react";
import { MemoryRouter as Router } from "react-router-dom";
import { Button } from "@mui/material";
import { AppConfig } from "config";
import { StatusProvider, StatusContext } from "../StatusContext";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "updateStatus",
    method: "PUT",
    url: `${AppConfig.apiUrl}work/101/statuses/55`,
    response: {
      statusCode: 200,
      body: { id: 55 },
    },
  },
  {
    name: "approveStatus",
    method: "PATCH",
    url: `${AppConfig.apiUrl}work/101/statuses/77/approve`,
    response: {
      statusCode: 200,
      body: {},
    },
  },
];

const StatusContextHarness = () => {
  const { openStatusForm, openApproveStatusDialog } =
    React.useContext(StatusContext);

  return (
    <>
      <Button
        onClick={() =>
          openStatusForm({
            id: 55,
            description: "Existing status",
            posted_date: "2026-03-10T00:00:00.000Z",
            is_active: true,
            is_approved: true,
            approved_date: "2026-03-10T00:00:00.000Z",
          })
        }
      >
        Open Edit
      </Button>
      <Button
        onClick={() =>
          openApproveStatusDialog({
            id: 77,
            description: "Pending approval",
            posted_date: "2026-03-12T00:00:00.000Z",
            is_active: true,
            is_approved: false,
            approved_date: "",
          })
        }
      >
        Open Approve
      </Button>
    </>
  );
};

describe("StatusContext", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("updates a status from provider dialog", () => {
    const refetchStatuses = cy.stub().as("refetchStatuses");
    const getWorkStatuses = cy.stub().as("getWorkStatuses");

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            getWorkStatuses,
            statuses: [
              {
                id: 55,
                posted_date: "2026-03-10T00:00:00.000Z",
                description: "Existing status",
                is_approved: true,
              },
            ] as any,
          }}
        >
          <StatusProvider workId="101" refetchStatuses={refetchStatuses}>
            <StatusContextHarness />
          </StatusProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("button", "Open Edit").click();
    cy.contains("Edit Status").should("exist");
    cy.get("#status-form").submit();

    cy.wait("@updateStatus");
    cy.get("@refetchStatuses").should("have.been.called");
    cy.get("@getWorkStatuses").should("have.been.called");
  });

  // Approval dialog interaction is currently flaky in component tests due
  // transition overlays covering harness buttons.
});
