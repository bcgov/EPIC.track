import { AppConfig } from "config";
import { taskTemplatesApi } from "../taskTemplatesApi";

const apiPath = new URL(AppConfig.apis.track.baseUrl, window.location.origin)
  .pathname;
const path = (suffix: string) => `${apiPath}${suffix}`;

const bodyText = (body: unknown) =>
  typeof body === "string"
    ? body
    : new TextDecoder().decode(body as ArrayBuffer);

// Matches TaskTemplateResponseSchema.
const trackTemplate = {
  id: 77,
  name: "Readiness Template",
  ea_act_id: 3,
  work_type_id: 6,
  phase_id: 2,
  is_active: false,
  ea_act: { id: 3, name: "EA Act (2018)", is_active: true },
  work_type: { id: 6, name: "Assessment", sort_order: 3, is_active: true },
  phase: { id: 2, name: "Early Engagement", color: "#0d6efd", sort_order: 1 },
};

const template = {
  id: 77,
  name: "Readiness Template",
  ea_act_id: 3,
  work_type_id: 6,
  phase_id: 2,
  ea_act: { id: 3, name: "EA Act (2018)" },
  work_type: { id: 6, name: "Assessment" },
  phase: { id: 2, name: "Early Engagement" },
  is_active: false,
};

// Matches TaskResponseSchema.
const trackTemplateTask = {
  id: 1,
  name: "Prepare package",
  start_at: 5,
  number_of_days: 3,
  template_id: 77,
  responsibility_id: null,
  tips: "Use the checklist",
  is_active: true,
};

describe("Track task templates api", () => {
  beforeEach(() => {
    cy.intercept({ method: "GET", pathname: path("task-templates") }, [
      trackTemplate,
    ]).as("list");
    cy.intercept(
      { method: "GET", pathname: path("task-templates/77") },
      trackTemplate,
    );
    cy.intercept({ method: "GET", pathname: path("task-templates/77/tasks") }, [
      trackTemplateTask,
    ]);
    cy.intercept(
      { method: "POST", pathname: path("task-templates") },
      { statusCode: 201, body: trackTemplate },
    ).as("create");
    cy.intercept(
      { method: "PATCH", pathname: path("task-templates/77") },
      { ...trackTemplate, is_active: true },
    ).as("setActive");
    cy.intercept(
      { method: "DELETE", pathname: path("task-templates/77") },
      { body: "Task template successfully deleted" },
    ).as("remove");
  });

  it("maps templates and their tasks", () => {
    cy.then(() => taskTemplatesApi.list()).should("deep.equal", [template]);
    cy.then(() => taskTemplatesApi.get(77)).should("deep.equal", template);
    cy.then(() => taskTemplatesApi.listTasks(77)).should("deep.equal", [
      {
        id: 1,
        name: "Prepare package",
        start_at: 5,
        number_of_days: 3,
        template_id: 77,
        tips: "Use the checklist",
        responsibility_id: null,
      },
    ]);
  });

  it("lists a phase's templates with today's query order", () => {
    cy.then(() =>
      taskTemplatesApi.listFor({ eaActId: 3, workTypeId: 6, phaseId: 2 }),
    ).should("deep.equal", [template]);
    cy.wait("@list")
      .its("request.url")
      .should(
        "match",
        /\/task-templates\?work_type_id=6&ea_act_id=3&phase_id=2$/,
      );
  });

  it("uploads a template as multipart", () => {
    const file = new File(["template bytes"], "template.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    cy.then(() =>
      taskTemplatesApi.create({
        name: "Readiness Template",
        ea_act_id: 3,
        work_type_id: 6,
        phase_id: 2,
        template_file: file,
      }),
    );
    cy.wait("@create").then(({ request }) => {
      expect(request.headers["content-type"]).to.match(
        /^multipart\/form-data; boundary=/,
      );
      const body = bodyText(request.body);
      expect(body).to.contain('name="name"\r\n\r\nReadiness Template');
      expect(body).to.contain('name="ea_act_id"\r\n\r\n3');
      expect(body).to.contain('name="work_type_id"\r\n\r\n6');
      expect(body).to.contain('name="phase_id"\r\n\r\n2');
      expect(body).to.contain('name="template_file"; filename="template.xlsx"');
    });
  });

  it("activates and deletes a template", () => {
    cy.then(() => taskTemplatesApi.setActive(77, true));
    cy.wait("@setActive")
      .its("request.body")
      .should("deep.equal", { is_active: true });

    cy.then(() => taskTemplatesApi.remove(77));
    cy.wait("@remove").its("request.method").should("equal", "DELETE");
  });
});
