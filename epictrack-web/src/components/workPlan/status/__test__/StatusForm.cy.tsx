import StatusForm from "../StatusForm";
import { StatusContext } from "../StatusContext";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";

describe("StatusForm", () => {
  it("submits existing status values", () => {
    const getWorkStatuses = cy.stub().as("getWorkStatuses");
    const onSave = cy
      .stub()
      .callsFake((_data, callback) => callback())
      .as("onSave");

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          getWorkStatuses,
          statuses: [
            {
              id: 10,
              posted_date: "2026-03-10T00:00:00.000Z",
              description: "Approved status",
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
            status: {
              id: 10,
              posted_date: "2026-03-10T00:00:00.000Z",
              description: "Approved status",
              is_approved: true,
            } as any,
            setStatus: () => {},
            onSave,
            setShowApproveStatusDialog: () => {},
            selectedHistoryIndex: 0,
            setSelectedHistoryIndex: () => {},
            setIsCloning: () => {},
            workId: "101",
            isCloning: false,
          }}
        >
          <StatusForm />
        </StatusContext.Provider>
      </WorkplanContext.Provider>,
    );

    cy.contains("Date").should("exist");
    cy.contains("Description").should("exist");

    cy.get("#status-form").submit();

    cy.get("@onSave").should("have.been.called");
    cy.get("@getWorkStatuses").should("have.been.called");
  });
});
