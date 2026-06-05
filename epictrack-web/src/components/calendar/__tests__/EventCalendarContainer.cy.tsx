import { MemoryRouter as Router } from "react-router-dom";
import { EventCalendarContainer } from "components/calendar/EventCalendarContainer";
import { mockCalendarEvents } from "../../../../cypress/support/common";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";
import { AppConfig } from "config";
import { EventCalendarProvider } from "../EventCalendarContext";
import { useEventCalendarContext } from "../EventCalendarContext";
import { EVENT_TYPE } from "components/workPlan/phase/type";

const endpoints: Endpoint[] = [
  {
    name: "getMilestones",
    method: "GET",
    url: `${AppConfig.apiUrl}milestones/calendar*`,
    response: {
      body: { items: mockCalendarEvents, total: mockCalendarEvents.length },
    },
  },
  {
    name: "getTasks",
    method: "GET",
    url: `${AppConfig.apiUrl}tasks/calendar*`,
    response: { body: { items: [], total: 0 } },
  },
];

const getCurrentMonthIso = (dayOffset = 0) => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), 10 + dayOffset);
  return date.toISOString();
};

const eventCalendarBranchEndpoints: Endpoint[] = [
  {
    name: "getMilestones",
    method: "GET",
    url: `${AppConfig.apiUrl}milestones/calendar*`,
    response: {
      body: {
        items: [
          {
            event: {
              id: 101,
              name: "Current Month Milestone",
              anticipated_date: getCurrentMonthIso(0),
              actual_date: null,
              number_of_days: 2,
              work_id: 9001,
              event_configuration: {
                event_type_id: 23,
              },
            },
            phase_name: "Planning",
            phase_id: 44,
            work_name: "Legend Work Alpha",
            work_id: 9001,
          },
        ],
        total: 1,
      },
    },
  },
  {
    name: "getTasks",
    method: "GET",
    url: `${AppConfig.apiUrl}tasks/calendar*`,
    response: {
      body: {
        items: [
          {
            event: {
              id: 501,
              name: "Current Month Task",
              start_date: getCurrentMonthIso(1),
              number_of_days: 2,
            },
            phase_name: "Planning",
            phase_id: 44,
            work_name: "Legend Work Alpha",
            work_id: 9001,
          },
        ],
        total: 1,
      },
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
        name: "Current Month Task",
        work_phase_id: 44,
        start_date: getCurrentMonthIso(1),
        number_of_days: 2,
        status: "in_progress",
        assignees: [{ assignee_id: 1 }],
        responsibilities: [{ responsibility_id: 2 }],
      },
    },
  },
  {
    name: "getMilestoneById",
    method: "GET",
    url: `${AppConfig.apiUrl}milestones/events/101`,
    response: {
      statusCode: 200,
      body: {
        id: 101,
        name: "Current Month Milestone",
        anticipated_date: getCurrentMonthIso(0),
        actual_date: null,
        notes: "",
        description: "",
        event_configuration_id: 301,
        event_configuration: {
          id: 301,
          name: "Open House",
          event_category_id: 1,
          event_type_id: 23,
          multiple_days: false,
          event_position: "INTERMEDIATE",
          visibilty_mode: "MANDATORY",
          work_phase_id: 44,
        },
        number_of_days: 2,
        high_priority: false,
        number_of_responses: 0,
        number_of_attendees: 0,
        topic: "",
        act_section_id: 0,
        reason: "",
        decision_maker_id: 0,
      },
    },
  },
  {
    name: "getWorkById",
    method: "GET",
    url: `${AppConfig.apiUrl}works/9001`,
    response: {
      statusCode: 200,
      body: {
        id: 9001,
        title: "Legend Work Alpha",
        start_date: getCurrentMonthIso(-5),
      },
    },
  },
  {
    name: "getWorkPhaseById",
    method: "GET",
    url: `${AppConfig.apiUrl}works/work-phases/44`,
    response: {
      statusCode: 200,
      body: {
        work_phase: {
          id: 44,
          legislated: false,
          is_suspended: false,
          start_date: getCurrentMonthIso(-8),
        },
      },
    },
  },
  {
    name: "getWorkPhaseAdditionalInfo",
    method: "GET",
    url: `${AppConfig.apiUrl}works/9001/phase/44/additionalinfo*`,
    response: {
      statusCode: 200,
      body: [],
    },
  },
  {
    name: "getResponsibilities",
    method: "GET",
    url: `${AppConfig.apiUrl}*responsibilities*`,
    response: {
      statusCode: 200,
      body: [],
    },
  },
  {
    name: "getWorkTeamMembers",
    method: "GET",
    url: `${AppConfig.apiUrl}works/9001/staff-roles*`,
    response: {
      statusCode: 200,
      body: [],
    },
  },
];

const ModalControlHarness = () => {
  const { events, loadEventDetails, setSelectedEvent } =
    useEventCalendarContext();

  return (
    <>
      <button
        onClick={() => {
          const milestone = events.find(
            (calendarEvent) =>
              calendarEvent.event.type === EVENT_TYPE.MILESTONE,
          );
          setSelectedEvent(milestone ?? null);
        }}
      >
        open-milestone-modal
      </button>
      <button
        onClick={() => {
          const task = events.find(
            (calendarEvent) => calendarEvent.event.type === EVENT_TYPE.TASK,
          );
          if (task) {
            void loadEventDetails(task);
          }
        }}
      >
        load-task-details
      </button>
      <button
        onClick={() => {
          const milestone = events.find(
            (calendarEvent) =>
              calendarEvent.event.type === EVENT_TYPE.MILESTONE,
          );
          if (milestone) {
            void loadEventDetails(milestone);
          }
        }}
      >
        load-milestone-details
      </button>
    </>
  );
};

describe("EventCalendarContainer", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders calendar with current year", () => {
    cy.mount(
      <Router>
        <EventCalendarProvider>
          <EventCalendarContainer />
        </EventCalendarProvider>
      </Router>,
    );

    // Year should render as plain text
    const currentYear = new Date().getFullYear();
    cy.contains(currentYear).should("exist");

    // Calendar should render days header
    cy.contains("M").should("exist");
    cy.contains("S").should("exist");

    // Months should render
    cy.contains(/Jan '\d{2}/).should("exist");
    cy.contains(/Dec '\d{2}/).should("exist");
  });

  it("navigates to previous and next year", () => {
    cy.mount(
      <Router>
        <EventCalendarProvider>
          <EventCalendarContainer />
        </EventCalendarProvider>
      </Router>,
    );

    const currentYear = new Date().getFullYear();

    cy.contains(currentYear).should("exist");

    // Click previous year button (first IconButton)
    cy.get("button").first().click();
    cy.contains(currentYear - 1).should("exist");

    // Click next button twice to go to future year
    cy.contains(currentYear - 1)
      .parent()
      .find("button")
      .last()
      .click()
      .click();

    cy.contains(currentYear + 1).should("exist");
  });

  it("renders task/milestone legend in default mode", () => {
    cy.mount(
      <Router>
        <EventCalendarProvider>
          <EventCalendarContainer />
        </EventCalendarProvider>
      </Router>,
    );

    cy.contains("Milestones").should("exist");
    cy.contains("Tasks").should("exist");
  });
});
