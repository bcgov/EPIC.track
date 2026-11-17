import { AppConfig } from "config";
import TemplateTaskList from "../TemplateTasksList";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "getTemplateTasks",
    method: "GET",
    url: `${AppConfig.apiUrl}task-templates/77/tasks*`,
    response: {
      body: [
        {
          id: 1,
          name: "Draft briefing",
          start_at: 1,
          number_of_days: 3,
          tips: "Do this first",
        },
      ],
    },
  },
  {
    name: "getTemplate",
    method: "GET",
    url: `${AppConfig.apiUrl}task-templates/77*`,
    response: {
      // TaskTemplateResponseSchema always nests these (non-null foreign keys).
      body: {
        id: 77,
        name: "Template A",
        is_active: true,
        ea_act_id: 3,
        work_type_id: 6,
        phase_id: 2,
        ea_act: { id: 3, name: "EA Act (2018)" },
        work_type: { id: 6, name: "Assessment" },
        phase: { id: 2, name: "Early Engagement" },
      },
    },
  },
  {
    name: "patchTemplate",
    method: "PATCH",
    url: `${AppConfig.apiUrl}task-templates/77*`,
    response: {
      statusCode: 200,
      body: {},
    },
  },
];

describe("TemplateTaskList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders task rows and toggles activation", () => {
    const onCancel = cy.stub().as("onCancel");
    const onApproval = cy.stub().as("onApproval");

    cy.mount(
      <TemplateTaskList
        templateId={77}
        onCancel={onCancel}
        onApproval={onApproval}
      />,
    );

    cy.wait(["@getTemplateTasks", "@getTemplate"]);

    cy.contains("Draft briefing").should("exist");
    cy.contains("Deactivate").should("exist").click();

    cy.wait("@patchTemplate");
    cy.get("@onApproval").should("have.been.called");

    cy.contains("Template Deactivated").should("exist");
    cy.contains("button", "Ok").click();
    cy.get("@onCancel").should("have.been.called");
  });
});
