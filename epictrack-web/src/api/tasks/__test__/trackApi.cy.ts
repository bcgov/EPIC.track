import Moment from "moment";
import { AppConfig } from "config";
import { isApiError } from "apiManager/apiError";
import { EVENT_STATUS } from "models/taskEvent";
import { tasksApi } from "../tasksApi";

const apiPath = new URL(AppConfig.apis.track.baseUrl, window.location.origin)
  .pathname;
const path = (suffix: string) => `${apiPath}${suffix}`;

const bodyText = (body: unknown) =>
  typeof body === "string"
    ? body
    : new TextDecoder().decode(body as ArrayBuffer);

const staff = {
  id: 12,
  first_name: "Sam",
  last_name: "Lead",
  full_name: "Lead, Sam",
  email: "sam.lead@gov.bc.ca",
};

// Matches TaskEventResponseSchema.
const trackTask = {
  id: 101,
  name: "Submit package",
  work_phase_id: 55,
  start_date: "2026-03-05T08:00:00+00:00",
  number_of_days: 3,
  tips: "Check the checklist",
  notes: "Notes",
  status: "INPROGRESS",
  is_active: true,
  assigned: "Sam Lead",
  responsibility: "EAO",
  assignees: [
    {
      id: 1,
      task_event_id: 101,
      assignee_id: 12,
      is_active: true,
      assignee: staff,
    },
  ],
  responsibilities: [
    { id: 2, task_event_id: 101, responsibility_id: 7, is_active: true },
  ],
};

const taskItem = {
  id: 101,
  name: "Submit package",
  work_phase_id: 55,
  start_date: "2026-03-05T08:00:00+00:00",
  number_of_days: 3,
  tips: "Check the checklist",
  notes: "Notes",
  status: EVENT_STATUS.INPROGRESS,
  assigned: "Sam Lead",
  responsibility: "EAO",
  assignees: [
    {
      id: 1,
      is_active: true,
      task_event_id: 101,
      assignee_id: 12,
      assignee: staff,
    },
  ],
  responsibilities: [
    { id: 2, is_active: true, responsibility_id: 7, task_event_id: 101 },
  ],
};

const taskEvent = {
  id: 101,
  name: "Submit package",
  work_phase_id: 55,
  start_date: "2026-03-05T08:00:00+00:00",
  number_of_days: 3,
  tips: "Check the checklist",
  notes: "Notes",
  status: EVENT_STATUS.INPROGRESS,
  assignee_ids: ["12"],
  responsibility_ids: ["7"],
};

const WRITABLE = [
  "name",
  "work_phase_id",
  "responsibility_ids",
  "start_date",
  "number_of_days",
  "tips",
  "notes",
  "assignee_ids",
  "status",
];

describe("Track tasks api", () => {
  beforeEach(() => {
    cy.intercept({ method: "GET", pathname: path("tasks/events") }, [
      trackTask,
    ]).as("list");
    cy.intercept(
      { method: "GET", pathname: path("tasks/events/101") },
      trackTask,
    );
    cy.intercept(
      { method: "GET", pathname: path("tasks/events/999") },
      { statusCode: 404, body: { message: "Task not found" } },
    );
    cy.intercept(
      { method: "POST", pathname: path("tasks/events") },
      { statusCode: 201, body: trackTask },
    ).as("create");
    cy.intercept(
      { method: "PUT", pathname: path("tasks/events/101") },
      trackTask,
    ).as("update");
    cy.intercept(
      { method: "PATCH", pathname: path("tasks/events") },
      { body: "Tasks updated" },
    ).as("updateMany");
    cy.intercept(
      { method: "DELETE", pathname: path("tasks/events") },
      { body: "Tasks deleted" },
    ).as("removeMany");
    cy.intercept(
      { method: "GET", pathname: path("tasks/events/staff-work/12") },
      [
        {
          ...trackTask,
          work: { id: 9, title: "Copper Mine - Assessment", notes: "FN" },
        },
      ],
    ).as("mine");
    cy.intercept(
      { method: "GET", pathname: path("tasks/calendar") },
      {
        items: [
          {
            work_name: "Copper Mine - Assessment",
            work_id: 9,
            phase_name: "Early Engagement",
            phase_id: 55,
            event: trackTask,
          },
        ],
        total: 1,
      },
    ).as("calendar");
    cy.intercept(
      { method: "POST", pathname: path("tasks/templates/901/events") },
      { statusCode: 201, body: [trackTask] },
    ).as("fromTemplate");
    cy.intercept(
      { method: "POST", pathname: path("tasks/work_phase/55/sheet") },
      { statusCode: 201, body: {} },
    ).as("sheet");
  });

  it("maps tasks for the lists and for the form", () => {
    cy.then(() => tasksApi.listForPhase(55)).should("deep.equal", [taskItem]);
    cy.wait("@list")
      .its("request.query")
      .should("deep.equal", { work_phase_id: "55" });
    cy.then(() => tasksApi.get(101)).should("deep.equal", taskEvent);
  });

  it("rejects with an ApiError for a missing task", () => {
    cy.then(() =>
      tasksApi.get(999).then(
        () => {
          throw new Error("expected get(999) to fail");
        },
        (error) => error,
      ),
    ).then((error) => {
      expect(isApiError(error)).to.equal(true);
      expect(error.status).to.equal(404);
    });
  });

  it("saves only the writable fields, with a formatted start date", () => {
    const formValues = {
      ...taskEvent,
      start_date: "2026-03-05T00:00:00-08:00",
      end_date: "2026-03-08",
    } as any;
    cy.then(() => tasksApi.create(formValues)).should("deep.equal", taskEvent);
    cy.wait("@create").then(({ request }) => {
      expect(request.body).to.have.all.keys(...WRITABLE);
      expect(request.body.start_date).to.equal(
        Moment(formValues.start_date).format(),
      );
      expect(request.body.assignee_ids).to.deep.equal(["12"]);
    });
    cy.then(() => tasksApi.update(101, formValues));
    cy.wait("@update")
      .its("request.body")
      .should("not.have.any.keys", "id", "end_date");
  });

  it("sends bulk updates as given and bulk deletes as two exact params", () => {
    const update = {
      task_ids: ["101", "102"],
      status: "COMPLETED",
      work_id: 9,
    };
    cy.then(() => tasksApi.updateMany(update));
    cy.wait("@updateMany").its("request.body").should("deep.equal", update);

    cy.then(() => tasksApi.removeMany(["101", "102"], 9));
    cy.wait("@removeMany")
      .its("request.query")
      .should("deep.equal", { task_ids: "101,102", work_id: "9" });

    cy.then(() => tasksApi.removeMany([], 9));
    cy.wait("@removeMany")
      .its("request.query")
      .should("deep.equal", { work_id: "9" });
  });

  it("lists my tasks and calendar tasks", () => {
    cy.then(() => tasksApi.listMine(12)).should("deep.equal", [
      {
        ...taskItem,
        work: { id: 9, title: "Copper Mine - Assessment", notes: "FN" },
      },
    ]);
    cy.wait("@mine")
      .its("request.query")
      .should("deep.equal", { is_active: "true" });

    cy.then(() =>
      tasksApi.listCalendar({
        event_types: ["task", "decision"],
        project_types: [],
        regions: ["2"],
        staff_id: 12,
        work_ids: [],
        work_types: [],
        year: 2026,
        teams: [],
      }),
    ).should("deep.equal", [
      {
        event: taskItem,
        work_id: 9,
        work_name: "Copper Mine - Assessment",
        phase_id: 55,
        phase_name: "Early Engagement",
      },
    ]);
    cy.wait("@calendar").then(({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.has("event_types[]")).to.equal(false);
      expect(params.getAll("regions[]")).to.deep.equal(["2"]);
      expect(params.get("staff_id")).to.equal("12");
      expect(params.get("year")).to.equal("2026");
    });
  });

  it("imports tasks from a template and from a sheet", () => {
    cy.then(() => tasksApi.importFromTemplate(901, 55));
    cy.wait("@fromTemplate")
      .its("request.body")
      .should("deep.equal", { work_phase_id: 55 });

    const sheet = new File(["sheet bytes"], "tasks.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    cy.then(() => tasksApi.importSheet(55, sheet));
    cy.wait("@sheet").then(({ request }) => {
      expect(request.headers["content-type"]).to.match(
        /^multipart\/form-data; boundary=/,
      );
      const body = bodyText(request.body);
      expect(body).to.contain('name="template_file"; filename="tasks.xlsx"');
      expect(body).to.contain("sheet bytes");
    });
  });
});
