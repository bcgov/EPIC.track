import { AppConfig } from "config";
import { store } from "store";
import { projectsQueryApi } from "api/projects";
import { ThirtySixtyNinety } from "../ThirtySixtyNinety";
import {
  WorkplanContext,
  initialWorkPlanContext,
} from "../../../WorkPlanContext";

describe("Issues ThirtySixtyNinety preview", () => {
  beforeEach(() => {
    store.dispatch(projectsQueryApi.util.resetApiState());
    cy.intercept("GET", `${AppConfig.apiUrl}projects/7`, {
      body: {
        id: 7,
        name: "River Project",
        description: "Project description",
      },
    });
  });

  it("renders fallback issues text when there are no approved high-priority active issues", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: {
            id: 101,
            current_work_phase_id: 2,
            report_description: "Work description",
            project_id: 7,
            project: { id: 7, name: "River Project" },
          } as any,
          workPhases: [
            {
              work_phase: { id: 2, name: "In Review" },
            },
          ] as any,
          statuses: [],
          issues: [
            {
              id: 77,
              title: "Low-priority issue",
              is_active: true,
              is_resolved: false,
              is_high_priority: false,
              updates: [
                {
                  id: 91,
                  description: "Update text",
                  is_approved: true,
                },
              ],
            },
          ] as any,
        }}
      >
        <ThirtySixtyNinety />
      </WorkplanContext.Provider>,
    );

    cy.contains("30-60-90 Preview").should("exist");
    cy.contains("Project Description (Auto-System Generated)").should("exist");
    cy.contains("River Project is in In Review").should("exist");
    cy.contains("Project description").should("exist");
    cy.contains("Your Issues will appear here.").should("exist");
    cy.contains("Status (").should("not.exist");
  });

  it("renders approved status and approved high-priority issue update", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: {
            id: 101,
            current_work_phase_id: 2,
            report_description: "Work description",
            project_id: 7,
            project: { id: 7, name: "River Project" },
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
              id: 88,
              title: "Funding risk",
              is_active: true,
              is_resolved: false,
              is_high_priority: true,
              updated_at: "2026-03-14T00:00:00.000Z",
              updates: [
                {
                  id: 99,
                  description: "Awaiting partner confirmation",
                  is_approved: true,
                },
              ],
            },
          ] as any,
        }}
      >
        <ThirtySixtyNinety />
      </WorkplanContext.Provider>,
    );

    cy.contains("Status (").should("exist");
    cy.contains("Approved status content").should("exist");
    cy.contains("Issues (").should("exist");
    cy.contains("Funding risk").should("exist");
    cy.contains("Awaiting partner confirmation").should("exist");
  });
});
