import { AppConfig } from "config";
import { ROLES } from "constants/application-constant";
import { MemoryRouter as Router } from "react-router-dom";
import { store } from "store";
import { userDetails } from "services/userService/userSlice";
import TemplateList from "../TemplateList";
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
        {
          id: 77,
          name: "Template A",
          is_active: true,
          ea_act: { id: 1, name: "2018" },
          work_type: { id: 2, name: "Assessment" },
          phase: { id: 3, name: "Readiness" },
        },
      ],
    },
  },
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
      body: {
        id: 77,
        name: "Template A",
        is_active: true,
      },
    },
  },
  {
    name: "deleteTemplate",
    method: "DELETE",
    url: `${AppConfig.apiUrl}task-templates/77*`,
    response: {
      statusCode: 200,
      body: {},
    },
  },
  {
    name: "getEaActs",
    method: "GET",
    url: `${AppConfig.apiUrl}ea-acts*`,
    response: {
      body: [{ id: 1, name: "2018" }],
    },
  },
  {
    name: "getWorkTypes",
    method: "GET",
    url: `${AppConfig.apiUrl}work-types*`,
    response: {
      body: [{ id: 2, name: "Assessment" }],
    },
  },
];

describe("TemplateList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);

    store.dispatch(
      userDetails({
        sub: "123",
        groups: [],
        preferred_username: "tester",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        staffId: 1,
        phone: "",
        position: "",
        roles: [ROLES.CREATE, ROLES.EDIT, ROLES.DELETE],
      }),
    );
  });

  it("shows templates, opens dialogs, and deletes a template", () => {
    cy.mount(
      <Router>
        <TemplateList />
      </Router>,
    );

    cy.wait("@getTemplates");

    cy.contains("Template A").should("exist").click();
    cy.wait(["@getTemplateTasks", "@getTemplate"]);
    cy.contains("Template Tasks").should("exist");
    cy.contains("button", "Cancel").click();

    cy.contains("button", "Create Task Template").click();
    cy.contains("Create Task Template Details").should("exist");
    cy.contains("button", "Cancel").click();

    cy.get("tbody tr").first().find("button").last().click({ force: true });
    cy.contains("Are you sure you want to delete?").should("exist");
    cy.contains("button", "Yes").click();

    cy.wait("@deleteTemplate");
    cy.get("@getTemplates.all").its("length").should("be.gte", 2);
  });
});
