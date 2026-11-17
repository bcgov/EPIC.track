import { useState } from "react";
import { MemoryRouter as Router } from "react-router-dom";
import EventListTable from "../EventListTable";
import { EventProvider } from "../EventContext";
import { EVENT_TYPE } from "../../phase/type";
import { EVENT_STATUS } from "models/taskEvent";

const draftEmpty = '{"blocks":[],"entityMap":{}}';

const events = [
  {
    id: 1,
    name: "Task A",
    type: EVENT_TYPE.TASK,
    start_date: "2026-03-01T00:00:00.000Z",
    end_date: "2026-03-03T00:00:00.000Z",
    number_of_days: 2,
    status: EVENT_STATUS.INPROGRESS,
    assignees: [
      {
        assignee: {
          first_name: "Alex",
          last_name: "Johnson",
        },
      },
    ],
    responsibility: "Lead",
    notes: draftEmpty,
    is_complete: false,
    event_configuration: {},
  },
  {
    id: 2,
    name: "Milestone B",
    type: EVENT_TYPE.MILESTONE,
    start_date: "2026-03-10T00:00:00.000Z",
    end_date: "2026-03-10T00:00:00.000Z",
    number_of_days: 0,
    status: EVENT_STATUS.COMPLETED,
    assignees: [],
    responsibility: "",
    notes: draftEmpty,
    is_complete: true,
    event_configuration: {
      event_position: "OTHER",
    },
  },
] as any;

// Events arrive after mount, as when a work plan phase loads.
const EventsArrive = () => {
  const [shown, setShown] = useState<any[]>([]);
  const noop = () => {
    return;
  };
  return (
    <Router>
      <EventProvider>
        <button onClick={() => setShown(events)}>load events</button>
        <EventListTable
          events={shown}
          loading={false}
          rowSelection={{}}
          setRowSelection={noop}
          onRowClick={noop}
          templateAvailable={
            { template_available: false, task_added: false } as any
          }
          userIsActiveTeamMember={true}
          onAddTask={noop}
          onAddMilestone={noop}
          handleExportToSheet={noop}
          handleTaskFileUpload={noop}
          setShowTemplateForm={noop}
          setShowDeleteDialog={noop}
        />
      </EventProvider>
    </Router>
  );
};

describe("EventListTable", () => {
  it("shows every event once they arrive, without an out-of-range page size", () => {
    // Below 720px MRT renders a native select, which never warns.
    cy.viewport(1280, 800);
    cy.window().then((win) => cy.spy(win.console, "warn").as("warn"));
    cy.mount(<EventsArrive />);

    cy.contains("button", "load events").click();
    cy.contains("Task A").should("exist");
    cy.contains("Milestone B").should("exist");
    cy.contains("label", "Rows per page")
      .parent()
      .should("contain.text", "All");
    cy.get("@warn").should(
      "not.have.been.calledWithMatch",
      /out-of-range value/,
    );
  });

  it("renders table rows and action buttons", () => {
    const onAddTask = cy.stub().as("onAddTask");
    const onAddMilestone = cy.stub().as("onAddMilestone");

    cy.mount(
      <Router>
        <EventProvider>
          <EventListTable
            events={events}
            loading={false}
            rowSelection={{}}
            setRowSelection={() => {
              return;
            }}
            onRowClick={() => {
              return;
            }}
            templateAvailable={
              { template_available: false, task_added: false } as any
            }
            userIsActiveTeamMember={true}
            onAddTask={onAddTask}
            onAddMilestone={onAddMilestone}
            handleExportToSheet={() => {
              return;
            }}
            handleTaskFileUpload={() => {
              return;
            }}
            setShowTemplateForm={() => {
              return;
            }}
            setShowDeleteDialog={() => {
              return;
            }}
          />
        </EventProvider>
      </Router>,
    );

    cy.contains("Task A").should("exist");
    cy.contains("Milestone B").should("exist");

    cy.contains("button", "Add Task").click();
    cy.get("@onAddTask").should("have.been.calledOnce");

    cy.contains("button", "Add Milestone").click();
    cy.get("@onAddMilestone").should("have.been.calledOnce");
  });

  it("shows template import icon when template is available", () => {
    const setShowTemplateForm = cy.stub().as("setShowTemplateForm");

    cy.mount(
      <Router>
        <EventProvider>
          <EventListTable
            events={events}
            loading={false}
            rowSelection={{}}
            setRowSelection={() => {
              return;
            }}
            onRowClick={() => {
              return;
            }}
            templateAvailable={
              { template_available: true, task_added: false } as any
            }
            userIsActiveTeamMember={true}
            onAddTask={() => {
              return;
            }}
            onAddMilestone={() => {
              return;
            }}
            handleExportToSheet={() => {
              return;
            }}
            handleTaskFileUpload={() => {
              return;
            }}
            setShowTemplateForm={setShowTemplateForm}
            setShowDeleteDialog={() => {
              return;
            }}
          />
        </EventProvider>
      </Router>,
    );

    cy.get("button .icon").first().parent("button").click();
    cy.get("@setShowTemplateForm").should("have.been.calledWith", true);
  });
});
