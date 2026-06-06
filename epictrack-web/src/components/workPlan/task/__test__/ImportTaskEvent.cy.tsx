import { MemoryRouter as Router } from "react-router-dom";
import { AppConfig } from "config";
import ImportTaskEvent from "../ImportTaskEvent";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "getTemplates",
    method: "GET",
    url: `${AppConfig.apiUrl}task-templates*`,
    response: {
      body: [
        { id: 11, name: "Template A", is_active: true },
        { id: 22, name: "Template B", is_active: true },
      ],
    },
  },
  {
    name: "getTemplateATasks",
    method: "GET",
    url: `${AppConfig.apiUrl}task-templates/11/tasks`,
    response: {
      body: [
        { id: 1, name: "Draft briefing" },
        { id: 2, name: "Prepare timeline" },
      ],
    },
  },
  {
    name: "getTemplateBTasks",
    method: "GET",
    url: `${AppConfig.apiUrl}task-templates/22/tasks`,
    response: {
      body: [{ id: 3, name: "Review submission" }],
    },
  },
];

describe("ImportTaskEvent", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("loads templates and updates task list on template selection", () => {
    const onSave = cy.stub().as("onSave");

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            work: {
              id: 99,
              ea_act_id: 1,
              work_type_id: 2,
            } as any,
            selectedWorkPhase: {
              work_phase: {
                id: 9,
                phase: {
                  id: 5,
                },
              },
            } as any,
          }}
        >
          <ImportTaskEvent onSave={onSave} />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.wait("@getTemplates");
    cy.wait("@getTemplateATasks");

    cy.contains("Template A").should("exist");
    cy.contains("Template B").should("exist");
    cy.contains("Draft briefing").should("exist");

    cy.contains("Template B").click();
    cy.wait("@getTemplateBTasks");
    cy.contains("Review submission").should("exist");

    cy.get("#import-tasks-form").submit();
    cy.get("@onSave").should("have.been.calledWith", 22);
  });
});
