import { ReferralSchedule } from "../ReferralSchedule";
import {
  WorkplanContext,
  initialWorkPlanContext,
} from "../../../WorkPlanContext";

describe("Issues ReferralSchedule", () => {
  it("renders fallback issues text when there are no active approved issues", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: {
            id: 101,
            current_work_phase_id: 2,
            report_description: "Work description",
            project: {
              name: "River Project",
              description: "Project description",
            },
          } as any,
          workPhases: [
            {
              work_phase: { id: 2, name: "In Review" },
            },
          ] as any,
          statuses: [],
          issues: [],
        }}
      >
        <ReferralSchedule />
      </WorkplanContext.Provider>,
    );

    cy.contains("Referral Schedule").should("exist");
    cy.contains("Work Description").should("exist");
    cy.contains("Your Issues will appear here.").should("exist");
    cy.contains("Status (").should("not.exist");
  });

  it("renders approved status and unresolved active issue updates", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: {
            id: 101,
            current_work_phase_id: 2,
            report_description: "Work description",
            project: {
              name: "River Project",
              description: "Project description",
            },
          } as any,
          workPhases: [
            {
              work_phase: { id: 2, name: "In Review" },
            },
          ] as any,
          statuses: [
            {
              id: 10,
              posted_date: "2026-03-10T00:00:00.000Z",
              description: "Current approved status",
              is_approved: true,
            },
          ] as any,
          issues: [
            {
              id: 77,
              title: "Funding risk",
              is_active: true,
              is_resolved: false,
              updated_at: "2026-03-14T00:00:00.000Z",
              updates: [
                {
                  id: 91,
                  description: "Awaiting partner confirmation",
                  is_approved: true,
                },
              ],
            },
          ] as any,
        }}
      >
        <ReferralSchedule />
      </WorkplanContext.Provider>,
    );

    cy.contains("Status").should("exist");
    cy.contains("Current approved status").should("exist");
    cy.contains("Issues").should("exist");
    cy.contains("Funding risk").should("exist");
    cy.contains("Awaiting partner confirmation").should("exist");
  });
});
