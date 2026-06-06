import { ReferralSchedule } from "../ReferralSchedule";
import {
  WorkplanContext,
  initialWorkPlanContext,
} from "../../../../WorkPlanContext";

describe("Status ReferralSchedule", () => {
  it("renders fallback status text when no approved statuses", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: {
            id: 101,
            current_work_phase_id: 2,
            report_description: "Work summary text",
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
    cy.contains("Project Description (Auto-System Generated)").should("exist");
    cy.contains("River Project is in In Review").should("exist");
    cy.contains("Your Statuses will appear here.").should("exist");
    cy.contains("Issue (").should("not.exist");
  });

  it("renders approved status and approved issue update", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: {
            id: 101,
            current_work_phase_id: 2,
            report_description: "Work summary text",
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
              description: "Approved status content",
              is_approved: true,
            },
          ] as any,
          issues: [
            {
              id: 55,
              title: "Permit delay",
              is_active: true,
              updated_at: "2026-03-12T00:00:00.000Z",
              updates: [
                {
                  id: 77,
                  description: "Partner comments pending",
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
    cy.contains("Approved status content").should("exist");
    cy.contains("Issue").should("exist");
    cy.contains("Permit delay").should("exist");
    cy.contains("Partner comments pending").should("exist");
  });
});
