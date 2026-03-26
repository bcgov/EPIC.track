import React from "react";
import { MemoryRouter as Router } from "react-router-dom";
import { Button } from "@mui/material";
import { WorkplanContext, WorkplanProvider } from "../WorkPlanContext";
import { workService } from "../../../services/workService/workService";
import { statusService } from "../../../services/statusService/statusService";
import { issueService } from "../../../services/issueService";
import stalenessSettingsService from "../../../services/stalenessSettingsService";

const WorkplanHarness = () => {
  const ctx = React.useContext(WorkplanContext);

  return (
    <>
      <div data-cy="loading">{String(ctx.loading)}</div>
      <div data-cy="work-name">{ctx.work?.project?.name ?? "none"}</div>
      <div data-cy="phase-count">{ctx.workPhases.length}</div>
      <div data-cy="team-count">{ctx.team.length}</div>
      <div data-cy="first-nation-count">{ctx.firstNations.length}</div>
      <div data-cy="status-count">{ctx.statuses.length}</div>
      <div data-cy="issue-count">{ctx.issues.length}</div>
      <div data-cy="issue-staleness">
        {ctx.issueStalenessSetting?.staleness_length ?? -1}
      </div>
      <Button onClick={() => ctx.loadIssues()}>Reload Issues</Button>
    </>
  );
};

describe("WorkPlanContext", () => {
  beforeEach(() => {
    cy.stub(workService, "getById")
      .as("getById")
      .resolves({
        status: 200,
        data: {
          id: 101,
          current_work_phase_id: 2,
          project: {
            name: "River Project",
          },
        },
      } as any);

    cy.stub(workService, "getWorkTeamMembers")
      .as("getWorkTeamMembers")
      .resolves({
        status: 200,
        data: [
          {
            staff: { email: "" },
            is_active: true,
          },
        ],
      } as any);

    cy.stub(workService, "getWorkPhases")
      .as("getWorkPhases")
      .resolves({
        status: 200,
        data: [
          {
            work_phase: { id: 2, name: "In Review" },
          },
        ],
      } as any);

    cy.stub(workService, "getWorkFirstNations")
      .as("getWorkFirstNations")
      .resolves({
        status: 200,
        data: [
          {
            id: 3,
            is_active: true,
          },
        ],
      } as any);

    cy.stub(statusService, "getAllbyWorkId")
      .as("getAllbyWorkId")
      .resolves({
        status: 200,
        data: [
          {
            id: 9,
            is_approved: true,
          },
        ],
      } as any);

    cy.stub(issueService, "getAllByWorkId")
      .as("getAllByWorkId")
      .resolves({
        status: 200,
        data: [
          {
            id: 8,
            title: "Issue title",
            updates: [],
          },
        ],
      } as any);

    cy.stub(stalenessSettingsService, "getIssueStaleness")
      .as("getIssueStaleness")
      .resolves({
        status: 200,
        data: {
          staleness_length: 5,
          warning_length: 2,
        },
      } as any);

    cy.stub(stalenessSettingsService, "getStatusStaleness")
      .as("getStatusStaleness")
      .resolves({
        status: 200,
        data: {
          staleness_length: 4,
          warning_length: 2,
        },
      } as any);
  });

  it("loads workplan data and exposes it through context", () => {
    cy.mount(
      <Router initialEntries={["/track/work-plan?work_id=101"]}>
        <WorkplanProvider>
          <WorkplanHarness />
        </WorkplanProvider>
      </Router>,
    );

    cy.get("@getById").should("have.been.calledWith", "101");
    cy.get("@getWorkTeamMembers").should("have.been.calledWith", 101);
    cy.get("@getWorkPhases").should("have.been.calledWith", "101");
    cy.get("@getWorkFirstNations").should("have.been.calledWith", 101);
    cy.get("@getAllbyWorkId").should("have.been.calledWith", 101);
    cy.get("@getIssueStaleness").should("have.been.called");
    cy.get("@getStatusStaleness").should("have.been.called");

    cy.get('[data-cy="loading"]').should("have.text", "false");
    cy.get('[data-cy="work-name"]').should("have.text", "River Project");
    cy.get('[data-cy="phase-count"]').should("have.text", "1");
    cy.get('[data-cy="team-count"]').should("have.text", "1");
    cy.get('[data-cy="first-nation-count"]').should("have.text", "1");
    cy.get('[data-cy="status-count"]').should("have.text", "1");
    cy.get('[data-cy="issue-count"]').should("have.text", "1");
    cy.get('[data-cy="issue-staleness"]').should("have.text", "5");

    cy.contains("button", "Reload Issues").click();
    cy.get("@getAllByWorkId").should("have.callCount", 2);
  });

  it("shows staleness settings error notification and still clears loading", () => {
    (stalenessSettingsService.getIssueStaleness as any).rejects(
      new Error("staleness failure"),
    );

    cy.mount(
      <Router initialEntries={["/track/work-plan?work_id=101"]}>
        <WorkplanProvider>
          <WorkplanHarness />
        </WorkplanProvider>
      </Router>,
    );

    cy.contains("Could not load Staleness settings").should("exist");
    cy.get('[data-cy="loading"]').should("have.text", "false");
  });
});
