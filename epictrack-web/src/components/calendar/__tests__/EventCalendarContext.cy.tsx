import { AppConfig } from "config";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";
import {
  EventCalendarProvider,
  useEventCalendarContext,
} from "../EventCalendarContext";
import { EVENT_TYPE } from "components/workPlan/phase/type";

type CalendarItem = {
  event: Record<string, any>;
  phase_name: string;
  phase_id: number;
  work_name: string;
  work_id: number;
};

const milestoneCalendarItems: CalendarItem[] = [
  {
    event: {
      id: 1,
      name: "Milestone One",
      anticipated_date: "2026-03-10T00:00:00.000Z",
      actual_date: null,
      number_of_days: 2,
      work_id: 101,
    },
    phase_name: "Phase Alpha",
    phase_id: 11,
    work_name: "Work Alpha",
    work_id: 101,
  },
];

const taskCalendarItems: CalendarItem[] = [
  {
    event: {
      id: 501,
      name: "Task One",
      start_date: "2026-03-12T00:00:00.000Z",
      number_of_days: 3,
    },
    phase_name: "Phase Alpha",
    phase_id: 11,
    work_name: "Work Alpha",
    work_id: 101,
  },
];

const endpoints: Endpoint[] = [
  {
    name: "getMilestones",
    method: "GET",
    url: `${AppConfig.apiUrl}milestones/calendar*`,
    response: {
      body: {
        items: milestoneCalendarItems,
        total: milestoneCalendarItems.length,
      },
    },
  },
  {
    name: "getTasks",
    method: "GET",
    url: `${AppConfig.apiUrl}tasks/calendar*`,
    response: {
      body: { items: taskCalendarItems, total: taskCalendarItems.length },
    },
  },
  {
    name: "getWorkById",
    method: "GET",
    url: `${AppConfig.apiUrl}works/101`,
    response: {
      statusCode: 200,
      body: { id: 101, title: "Work Alpha" },
    },
  },
  {
    name: "getWorkPhaseById",
    method: "GET",
    url: `${AppConfig.apiUrl}works/work-phases/11`,
    response: {
      statusCode: 200,
      body: { work_phase: { id: 11, name: "Phase Alpha" } },
    },
  },
  {
    name: "getMilestoneById",
    method: "GET",
    url: `${AppConfig.apiUrl}milestones/events/1`,
    response: {
      statusCode: 200,
      body: { id: 1, name: "Milestone One", actual_date: null },
    },
  },
  {
    name: "getTaskById",
    method: "GET",
    url: `${AppConfig.apiUrl}tasks/events/501`,
    response: {
      statusCode: 200,
      body: {
        id: 501,
        name: "Task One",
        work_phase_id: 11,
        assignees: [{ assignee_id: 7 }],
        responsibilities: [{ responsibility_id: 12 }],
      },
    },
  },
];

const ContextHarness = () => {
  const context = useEventCalendarContext();
  const monthKey = Object.keys(context.collapsedMonths)[0] || "";

  return (
    <div>
      <div data-cy="events-count">{context.events.length}</div>
      <div data-cy="event-types">
        {context.events.map((event) => event.event.type).join(",")}
      </div>
      <div data-cy="month-key">{monthKey}</div>
      <div data-cy="month-collapsed">
        {monthKey ? String(context.collapsedMonths[monthKey]) : ""}
      </div>
      <div data-cy="modal-open">{String(context.modalOpen)}</div>
      <div data-cy="selected-type">
        {context.selectedEvent?.event?.type ?? ""}
      </div>
      <div data-cy="milestone-name">{context.milestoneEvent?.name ?? ""}</div>
      <div data-cy="task-name">{context.taskEvent?.name ?? ""}</div>
      <div data-cy="task-assignees">
        {context.taskEvent?.assignee_ids?.join(",") ?? ""}
      </div>
      <div data-cy="task-responsibilities">
        {context.taskEvent?.responsibility_ids?.join(",") ?? ""}
      </div>
      <div data-cy="work-title">{context.work?.title ?? ""}</div>
      <div data-cy="work-phase-id">{context.workPhase?.id ?? ""}</div>

      <button
        onClick={() => {
          context.setMilestoneSelected(true);
          context.setTaskSelected(false);
        }}
      >
        milestone-only
      </button>
      <button
        onClick={() => {
          context.setMilestoneSelected(false);
          context.setTaskSelected(true);
        }}
      >
        task-only
      </button>
      <button
        onClick={() => {
          context.setMilestoneSelected(true);
          context.setTaskSelected(true);
        }}
      >
        both
      </button>
      <button
        onClick={() => {
          context.setMilestoneSelected(false);
          context.setTaskSelected(false);
        }}
      >
        reset-filter
      </button>
      <button onClick={() => monthKey && context.toggleMonth(monthKey)}>
        toggle-month
      </button>
      <button
        onClick={() => {
          const event = context.events.find(
            (calendarEvent) =>
              calendarEvent.event.type === EVENT_TYPE.MILESTONE,
          );
          if (event) {
            void context.handleEventClick(event);
          }
        }}
      >
        open-milestone
      </button>
      <button
        onClick={() => {
          const event = context.events.find(
            (calendarEvent) => calendarEvent.event.type === EVENT_TYPE.TASK,
          );
          if (event) {
            void context.handleEventClick(event);
          }
        }}
      >
        open-task
      </button>
      <button onClick={context.onCancelHandler}>cancel</button>
      <button onClick={context.onSaveHandler}>save</button>
    </div>
  );
};

describe("EventCalendarContext", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);

    cy.mount(
      <EventCalendarProvider
        initialSearchOptions={{
          event_types: ["include_tasks:true"],
          project_types: [],
          regions: [],
          staff_id: null,
          work_ids: [],
          work_types: [],
          teams: [],
          year: 2026,
        }}
      >
        <ContextHarness />
      </EventCalendarProvider>,
    );

    cy.wait("@getMilestones");
    cy.wait("@getTasks");
  });

  it("loads milestone and task events and filters by selection toggles", () => {
    cy.get('[data-cy="events-count"]').should("contain.text", "2");
    cy.get('[data-cy="event-types"]').should(
      "contain.text",
      EVENT_TYPE.MILESTONE,
    );
    cy.get('[data-cy="event-types"]').should("contain.text", EVENT_TYPE.TASK);

    cy.contains("button", "milestone-only").click();
    cy.get('[data-cy="events-count"]').should("contain.text", "1");
    cy.get('[data-cy="event-types"]').should("have.text", EVENT_TYPE.MILESTONE);

    cy.contains("button", "task-only").click();
    cy.get('[data-cy="events-count"]').should("contain.text", "1");
    cy.get('[data-cy="event-types"]').should("have.text", EVENT_TYPE.TASK);

    cy.contains("button", "both").click();
    cy.get('[data-cy="events-count"]').should("contain.text", "2");

    cy.contains("button", "reset-filter").click();
    cy.get('[data-cy="events-count"]').should("contain.text", "2");
  });

  it("loads milestone details and resets modal with cancel", () => {
    cy.contains("button", "open-milestone").click();

    cy.wait("@getWorkById");
    cy.wait("@getWorkPhaseById");
    cy.wait("@getMilestoneById");

    cy.get('[data-cy="modal-open"]').should("have.text", "true");
    cy.get('[data-cy="selected-type"]').should(
      "have.text",
      EVENT_TYPE.MILESTONE,
    );
    cy.get('[data-cy="milestone-name"]').should("have.text", "Milestone One");
    cy.get('[data-cy="work-title"]').should("have.text", "Work Alpha");
    cy.get('[data-cy="work-phase-id"]').should("have.text", "11");

    cy.contains("button", "cancel").click();
    cy.get('[data-cy="modal-open"]').should("have.text", "false");
    cy.get('[data-cy="milestone-name"]').should("have.text", "");
  });

  it("loads task details with mapped assignees and refetches on save", () => {
    cy.contains("button", "open-task").click();

    cy.wait("@getWorkById");
    cy.wait("@getTaskById");

    cy.get('[data-cy="modal-open"]').should("have.text", "true");
    cy.get('[data-cy="selected-type"]').should("have.text", EVENT_TYPE.TASK);
    cy.get('[data-cy="task-name"]').should("have.text", "Task One");
    cy.get('[data-cy="task-assignees"]').should("have.text", "7");
    cy.get('[data-cy="task-responsibilities"]').should("have.text", "12");

    cy.contains("button", "save").click();
    cy.wait("@getMilestones");
    cy.wait("@getTasks");

    cy.get('[data-cy="modal-open"]').should("have.text", "false");
    cy.get('[data-cy="task-name"]').should("have.text", "");
  });
});
