import { MemoryRouter as Router } from "react-router-dom";
import { store } from "store";
import { AppConfig } from "config";
import MyTasksList from "../MyTasksList";
import { EVENT_STATUS } from "models/taskEvent";
import { userDetails } from "services/userService/userSlice";
import { ROLES } from "constants/application-constant";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";

const user = store.getState().user.userDetail;

const endpoints: Endpoint[] = [
  {
    name: "getMyTasks",
    method: "GET",
    url: `${AppConfig.apiUrl}tasks/events/staff-work/*`,
    response: {
      body: [
        {
          id: 700,
          name: "Draft Review Task",
          work_phase_id: 55,
          start_date: "2026-03-15T00:00:00.000Z",
          number_of_days: 2,
          tips: "",
          notes: '{"blocks":[],"entityMap":{}}',
          status: EVENT_STATUS.INPROGRESS,
          assignees: [
            {
              assignee_id: Number(user.staffId || 1),
              assignee: {
                first_name: user.firstName || "Test",
                last_name: user.lastName || "User",
              },
            },
          ],
          responsibilities: [
            {
              responsibility_id: 10,
              is_active: true,
            },
          ],
          work: {
            id: 101,
            title: "Alpha Work",
          },
        },
      ],
    },
  },
];

const setupTaskFormDependencies = () => {
  cy.intercept("GET", "**/responsibilities*", {
    statusCode: 200,
    body: [],
  }).as("getResponsibilities");

  cy.intercept("GET", "**/works/*/staff-roles*", {
    statusCode: 200,
    body: [],
  }).as("getWorkTeamMembers");
};

describe("MyTasksList", () => {
  beforeEach(() => {
    window.sessionStorage.removeItem("myTasks-listing-column-filters");

    const userState = store.getState().user.userDetail;
    store.dispatch(
      userDetails({
        ...userState,
        roles: user.roles || [],
      }),
    );
  });

  it("renders the user's tasks in the table", () => {
    setupIntercepts(endpoints);

    cy.mount(
      <Router>
        <MyTasksList />
      </Router>,
    );

    cy.wait("@getMyTasks");
    cy.contains("Draft Review Task").should("exist");
    cy.contains("Alpha Work").should("exist");
    cy.contains("In Progress").should("exist");
  });

  it("renders all supported progress labels", () => {
    setupIntercepts([
      {
        name: "getMyTasksAllStatuses",
        method: "GET",
        url: `${AppConfig.apiUrl}tasks/events/staff-work/*`,
        response: {
          body: [
            {
              id: 701,
              name: "Task A",
              work_phase_id: 55,
              start_date: "2026-03-15T00:00:00.000Z",
              number_of_days: 2,
              tips: "",
              notes: '{"blocks":[],"entityMap":{}}',
              status: EVENT_STATUS.NOT_STARTED,
              assignees: [
                {
                  assignee_id: Number(user.staffId || 1),
                  assignee: {
                    first_name: user.firstName || "Test",
                    last_name: user.lastName || "User",
                  },
                },
              ],
              responsibilities: [{ responsibility_id: 10, is_active: true }],
              work: { id: 101, title: "Alpha Work" },
            },
            {
              id: 702,
              name: "Task B",
              work_phase_id: 56,
              start_date: "2026-03-16T00:00:00.000Z",
              number_of_days: 3,
              tips: "",
              notes: '{"blocks":[],"entityMap":{}}',
              status: EVENT_STATUS.INPROGRESS,
              assignees: [
                {
                  assignee_id: Number(user.staffId || 1),
                  assignee: {
                    first_name: user.firstName || "Test",
                    last_name: user.lastName || "User",
                  },
                },
              ],
              responsibilities: [{ responsibility_id: 11, is_active: true }],
              work: { id: 102, title: "Beta Work" },
            },
          ],
        },
      },
    ]);

    cy.mount(
      <Router>
        <MyTasksList />
      </Router>,
    );

    cy.wait("@getMyTasksAllStatuses");
    cy.contains("Not Started").should("exist");
    cy.contains("In Progress").should("exist");
  });

  it("renders completed tasks when cached filters include completed status", () => {
    const assignedDisplayName = `${user.firstName || "Test"} ${user.lastName || "User"}`;

    window.sessionStorage.setItem(
      "myTasks-listing-column-filters",
      JSON.stringify([
        {
          id: "status",
          value: [EVENT_STATUS.COMPLETED],
        },
        {
          id: "assigned",
          value: [assignedDisplayName],
        },
      ]),
    );

    setupIntercepts([
      {
        name: "getMyTasksCompleted",
        method: "GET",
        url: `${AppConfig.apiUrl}tasks/events/staff-work/*`,
        response: {
          body: [
            {
              id: 703,
              name: "Task C",
              work_phase_id: 57,
              start_date: "2026-03-17T00:00:00.000Z",
              number_of_days: 1,
              tips: "",
              notes: '{"blocks":[],"entityMap":{}}',
              status: EVENT_STATUS.COMPLETED,
              assignees: [
                {
                  assignee_id: Number(user.staffId || 1),
                  assignee: {
                    first_name: user.firstName || "Test",
                    last_name: user.lastName || "User",
                  },
                },
              ],
              responsibilities: [{ responsibility_id: 12, is_active: true }],
              work: { id: 103, title: "Gamma Work" },
            },
          ],
        },
      },
    ]);

    cy.mount(
      <Router>
        <MyTasksList />
      </Router>,
    );

    cy.wait("@getMyTasksCompleted");
    cy.contains("Task C").should("exist");
    cy.contains("Complete").should("exist");
  });

  it("renders task name as link when user has edit permission", () => {
    const userState = store.getState().user.userDetail;
    store.dispatch(
      userDetails({
        ...userState,
        roles: [ROLES.EDIT],
      }),
    );

    setupIntercepts(endpoints);

    cy.mount(
      <Router>
        <MyTasksList />
      </Router>,
    );

    cy.wait("@getMyTasks");
    cy.contains("a", "Draft Review Task").should("exist");
  });

  it("opens delete confirmation and closes on cancel without deleting", () => {
    const userState = store.getState().user.userDetail;
    store.dispatch(
      userDetails({
        ...userState,
        roles: [ROLES.EDIT],
      }),
    );

    setupIntercepts(endpoints);
    setupTaskFormDependencies();
    cy.intercept("DELETE", `${AppConfig.apiUrl}tasks/events*`, {
      statusCode: 200,
      body: {},
    }).as("deleteTask");

    cy.mount(
      <Router>
        <MyTasksList />
      </Router>,
    );

    cy.wait("@getMyTasks");
    cy.contains("a", "Draft Review Task").click({ force: true });
    cy.wait("@getResponsibilities");
    cy.wait("@getWorkTeamMembers");
    cy.contains("button", "Delete").click({ force: true });
    cy.contains("Are you sure you want to delete this task?").should("exist");
    cy.contains("button", "No").click({ force: true });
    cy.contains("Are you sure you want to delete this task?").should(
      "not.exist",
    );
    cy.get("@deleteTask.all").should("have.length", 0);
  });

  it("deletes task on confirm and refreshes list", () => {
    const userState = store.getState().user.userDetail;
    store.dispatch(
      userDetails({
        ...userState,
        roles: [ROLES.EDIT],
      }),
    );

    setupTaskFormDependencies();

    let getMyTasksCalls = 0;
    cy.intercept(
      "GET",
      `${AppConfig.apiUrl}tasks/events/staff-work/*`,
      (req) => {
        getMyTasksCalls += 1;
        req.reply({
          body: getMyTasksCalls === 1 ? endpoints[0].response?.body : [],
        });
      },
    ).as("getMyTasksSequence");

    cy.intercept(
      {
        method: "DELETE",
        url: `${AppConfig.apiUrl}tasks/events*`,
        times: 1,
      },
      {
        statusCode: 200,
        body: {},
      },
    ).as("deleteTaskSuccess");

    cy.mount(
      <Router>
        <MyTasksList />
      </Router>,
    );

    cy.wait("@getMyTasksSequence");

    cy.contains("a", "Draft Review Task").click({ force: true });
    cy.wait("@getResponsibilities");
    cy.wait("@getWorkTeamMembers");
    cy.contains("button", "Delete").click({ force: true });
    cy.contains("button", "Yes").click({ force: true });
    cy.wait("@deleteTaskSuccess");
    cy.wait("@getMyTasksSequence");
    cy.contains("Draft Review Task").should("not.exist");
  });

  it("does not refresh when delete is unsuccessful", () => {
    cy.on("uncaught:exception", (err) => {
      if (err.message.includes("Request failed with status code 500")) {
        return false;
      }
    });

    const userState = store.getState().user.userDetail;
    store.dispatch(
      userDetails({
        ...userState,
        roles: [ROLES.EDIT],
      }),
    );

    setupTaskFormDependencies();

    cy.intercept("GET", `${AppConfig.apiUrl}tasks/events/staff-work/*`, {
      body: endpoints[0].response?.body,
    }).as("getMyTasksFailureScenario");

    cy.intercept("DELETE", `${AppConfig.apiUrl}tasks/events*`, {
      statusCode: 500,
      body: {},
    }).as("deleteTaskFailure");

    cy.mount(
      <Router>
        <MyTasksList />
      </Router>,
    );

    cy.wait("@getMyTasksFailureScenario");
    cy.contains("a", "Draft Review Task").click({ force: true });
    cy.wait("@getResponsibilities");
    cy.wait("@getWorkTeamMembers");
    cy.contains("button", "Delete").click({ force: true });
    cy.contains("button", "Yes").click({ force: true });
    cy.wait("@deleteTaskFailure");
    cy.get("@getMyTasksFailureScenario.all").should("have.length", 1);
    cy.contains("Draft Review Task").should("exist");
  });
});
