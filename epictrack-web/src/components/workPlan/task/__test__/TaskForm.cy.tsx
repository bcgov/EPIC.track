import { AppConfig } from "config";
import TaskForm from "../TaskForm";
import { EventProvider } from "../../event/EventContext";
import { EVENT_STATUS } from "models/taskEvent";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "getResponsibilities",
    method: "GET",
    url: "**/responsibilities*",
    response: {
      body: [{ id: 1, name: "Lead" }],
    },
  },
  {
    name: "getWorkTeamMembers",
    method: "GET",
    url: `${AppConfig.apiUrl}works/101/staff-roles*`,
    response: {
      body: [
        {
          staff: {
            id: 10,
            full_name: "Alex Johnson",
          },
        },
      ],
    },
  },
  {
    name: "updateTask",
    method: "PUT",
    url: `${AppConfig.apiUrl}tasks/events/42`,
    response: {
      body: { id: 42 },
    },
  },
];

const existingTaskEvent = {
  id: 42,
  name: "Review package",
  work_phase_id: 55,
  start_date: "2026-03-10T00:00:00.000Z",
  number_of_days: 2,
  tips: "",
  notes: '{"blocks":[],"entityMap":{}}',
  assignee_ids: ["10"],
  responsibility_ids: ["1"],
  status: EVENT_STATUS.INPROGRESS,
} as any;

describe("TaskForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("submits updated task details", () => {
    const onSave = cy.stub().as("onSave");

    cy.mount(
      <EventProvider>
        <TaskForm
          onSave={onSave}
          taskEvent={existingTaskEvent}
          work_id={101}
          phase_id={55}
        />
      </EventProvider>,
    );

    cy.wait(["@getResponsibilities", "@getWorkTeamMembers"]);

    cy.get('input[placeholder="Title"]').clear().type("Review package updated");
    cy.get("#task-form").submit();

    cy.wait("@updateTask");
    cy.get("@onSave").should("have.been.calledOnce");
  });
});
