import StatusView from "../StatusView";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import { StatusContext } from "../StatusContext";

describe("StatusView", () => {
  it("shows stale warning when latest approved status is out of date", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          isActiveTeamMember: true,
          work: { is_complete: false } as any,
          statusStalenessSetting: {
            staleness_length: 1,
            warning_length: 0,
          } as any,
          statuses: [
            {
              id: 10,
              posted_date: "2024-01-01T00:00:00.000Z",
              description: "Older approved status",
              is_approved: true,
            },
          ] as any,
        }}
      >
        <StatusContext.Provider
          value={{
            openStatusForm: () => {},
            openApproveStatusDialog: () => {},
            setShowStatusForm: () => {},
            status: null,
            setStatus: () => {},
            onSave: () => {},
            setShowApproveStatusDialog: () => {},
            selectedHistoryIndex: 0,
            setSelectedHistoryIndex: () => {},
            setIsCloning: () => {},
            workId: "101",
            isCloning: false,
          }}
        >
          <StatusView />
        </StatusContext.Provider>
      </WorkplanContext.Provider>,
    );

    cy.contains("The Work status is out of date").should("exist");
    cy.contains("Approved").should("exist");
  });

  it("renders history and triggers new update action", () => {
    const setStatus = cy.stub().as("setStatus");
    const setIsCloning = cy.stub().as("setIsCloning");
    const setShowStatusForm = cy.stub().as("setShowStatusForm");

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          isActiveTeamMember: true,
          work: { is_complete: false } as any,
          statusStalenessSetting: {
            staleness_length: 999,
            warning_length: 500,
          } as any,
          statuses: [
            {
              id: 20,
              posted_date: "2026-03-01T00:00:00.000Z",
              description: "Current approved status",
              is_approved: true,
            },
            {
              id: 21,
              posted_date: "2026-02-20T00:00:00.000Z",
              description: "Previous approved status",
              is_approved: true,
            },
          ] as any,
        }}
      >
        <StatusContext.Provider
          value={{
            openStatusForm: () => {},
            openApproveStatusDialog: () => {},
            setShowStatusForm,
            status: null,
            setStatus,
            onSave: () => {},
            setShowApproveStatusDialog: () => {},
            selectedHistoryIndex: 0,
            setSelectedHistoryIndex: () => {},
            setIsCloning,
            workId: "101",
            isCloning: false,
          }}
        >
          <StatusView />
        </StatusContext.Provider>
      </WorkplanContext.Provider>,
    );

    cy.contains("STATUS HISTORY").should("exist");
    cy.contains("Previous approved status").should("exist");

    cy.contains("button", "New Update").click();
    cy.get("@setStatus").should("have.been.called");
    cy.get("@setIsCloning").should("have.been.calledWith", true);
    cy.get("@setShowStatusForm").should("have.been.calledWith", true);
  });
});
