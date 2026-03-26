import { MemoryRouter as Router } from "react-router-dom";
import EventList from "../EventList";
import { EventProvider } from "../EventContext";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import { EVENT_TYPE } from "../../phase/type";
import { EVENT_STATUS } from "../../../../models/taskEvent";
import { taskEventService } from "../../../../services/taskEventService/taskEventService";
import { eventService } from "../../../../services/eventService/eventService";
import { workService } from "../../../../services/workService/workService";
import { responsibilityService } from "../../../../services/responsibilityService/responsibilityService";
import { templateService } from "../../../../services/taskService/templateService";
import { store } from "../../../../store";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";

const selectedWorkPhase = {
  work_phase: {
    id: 12,
    name: "Readiness",
    legislated: true,
    is_completed: false,
    is_suspended: true,
    phase: {
      name: "Readiness",
    },
  },
} as any;

describe("EventList", { retries: 2 }, () => {
  beforeEach(() => {
    cy.stub(taskEventService, "getAll")
      .as("getAllTasks")
      .resolves({
        status: 200,
        data: [
          {
            id: 101,
            name: "Submit package",
            start_date: "2026-03-05T00:00:00.000Z",
            number_of_days: 3,
            assignees: [],
            responsibilities: [],
            status: EVENT_STATUS.INPROGRESS,
            notes: '{"blocks":[],"entityMap":{}}',
          },
        ],
      } as any);

    cy.stub(eventService, "getMilestoneEvents")
      .as("getMilestones")
      .resolves({
        status: 200,
        data: [
          {
            id: 202,
            name: "Start",
            anticipated_date: "2026-03-01T00:00:00.000Z",
            actual_date: "2026-03-01T00:00:00.000Z",
            event_configuration: {
              visibility: "MANDATORY",
              event_position: "START",
            },
          },
        ],
      } as any);

    cy.stub(workService, "checkTemplateUploadStatus")
      .as("checkTemplateUploadStatus")
      .resolves({
        status: 200,
        data: {
          template_available: false,
          task_added: false,
        },
      } as any);

    cy.stub(responsibilityService, "getResponsibilities")
      .as("getResponsibilities")
      .resolves({
        status: 200,
        data: [{ id: 1, name: "EAO" }],
      } as any);
  });

  it("loads events and renders suspended warning", () => {
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub().as("setSelectedWorkPhase"),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.get("@getMilestones").should("have.been.calledWith", 12);
    cy.get("@getAllTasks").should("have.been.calledWith", 12);
    cy.get("@checkTemplateUploadStatus").should("have.been.calledWith", 12);
    cy.get("@getResponsibilities").should("have.been.called");

    cy.contains("Submit package").should("exist");
    cy.contains("The Work is suspended").should("exist");
    cy.contains("button", "Add Task").should("exist");
  });

  it("keeps add task disabled for non-team members", () => {
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("button", "Add Task").should("be.disabled");
  });

  it("shows phase end warning when an END milestone occurs before mandatory milestones", () => {
    (eventService.getMilestoneEvents as any).resolves({
      status: 200,
      data: [
        {
          id: 301,
          name: "Phase End",
          anticipated_date: "2026-03-01T00:00:00.000Z",
          actual_date: null,
          event_configuration: {
            visibility: "MANDATORY",
            event_position: "END",
          },
        },
        {
          id: 302,
          name: "Required Milestone",
          anticipated_date: "2026-03-10T00:00:00.000Z",
          actual_date: null,
          event_configuration: {
            visibility: "MANDATORY",
            event_position: "INTERMEDIATE",
          },
        },
      ],
    } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Phase End Event is Out of Order").should("exist");
    cy.contains("Phase End").should("exist");
  });

  it("enables add task for active team member and disables template button after template upload", () => {
    const userEmail = store.getState().user.userDetail.email;

    (workService.checkTemplateUploadStatus as any).resolves({
      status: 200,
      data: {
        template_available: true,
        task_added: true,
      },
    } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [
              {
                is_active: true,
                staff_id: 10,
                staff: {
                  email: userEmail,
                  full_name: "Active User",
                },
              },
            ] as any,
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("button", "Add Task").should("not.be.disabled");
    cy.get("button .icon").first().parent("button").should("be.disabled");
  });

  it("closes suspended warning when dismiss button is clicked", () => {
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("The Work is suspended").should("exist");
    cy.contains('[data-cy="warning-box-title"]', "The Work is suspended")
      .parentsUntil(".MuiGrid-container")
      .parent()
      .find("button")
      .first()
      .click({ force: true });
    cy.contains("The Work is suspended").should("not.exist");
  });

  it("opens task template dialog when template import is available", () => {
    const userEmail = store.getState().user.userDetail.email;

    (workService.checkTemplateUploadStatus as any).resolves({
      status: 200,
      data: {
        template_available: true,
        task_added: false,
      },
    } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [
              {
                is_active: true,
                staff_id: 10,
                staff: {
                  email: userEmail,
                  full_name: "Active User",
                },
              },
            ] as any,
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("button", "Add Milestone")
      .parent()
      .within(() => {
        cy.get("button .icon")
          .first()
          .parent("button")
          .should("not.be.disabled")
          .click();
      });
    cy.contains('[role="dialog"]', "Task Template").should("exist");
  });

  it("does not show phase end warning when END milestone is last", () => {
    (eventService.getMilestoneEvents as any).resolves({
      status: 200,
      data: [
        {
          id: 401,
          name: "Start",
          anticipated_date: "2026-03-01T00:00:00.000Z",
          actual_date: null,
          event_configuration: {
            visibility: "MANDATORY",
            event_position: "START",
          },
        },
        {
          id: 402,
          name: "Intermediate Mandatory",
          anticipated_date: "2026-03-05T00:00:00.000Z",
          actual_date: null,
          event_configuration: {
            visibility: "MANDATORY",
            event_position: "INTERMEDIATE",
          },
        },
        {
          id: 403,
          name: "Phase End",
          anticipated_date: "2026-03-10T00:00:00.000Z",
          actual_date: null,
          event_configuration: {
            visibility: "MANDATORY",
            event_position: "END",
          },
        },
      ],
    } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Phase End Event is Out of Order").should("not.exist");
  });

  it("does not show phase end warning for non-legislated phases", () => {
    const nonLegislatedPhase = {
      work_phase: {
        ...selectedWorkPhase.work_phase,
        legislated: false,
      },
    } as any;

    (eventService.getMilestoneEvents as any).resolves({
      status: 200,
      data: [
        {
          id: 501,
          name: "Phase End",
          anticipated_date: "2026-03-01T00:00:00.000Z",
          actual_date: null,
          event_configuration: {
            visibility: "MANDATORY",
            event_position: "END",
          },
        },
        {
          id: 502,
          name: "Required Milestone",
          anticipated_date: "2026-03-10T00:00:00.000Z",
          actual_date: null,
          event_configuration: {
            visibility: "MANDATORY",
            event_position: "INTERMEDIATE",
          },
        },
      ],
    } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [nonLegislatedPhase],
            selectedWorkPhase: nonLegislatedPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Phase End Event is Out of Order").should("not.exist");
  });

  it("opens task dialog from Add Task action", () => {
    const userEmail = store.getState().user.userDetail.email;

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [
              {
                is_active: true,
                staff_id: 10,
                staff: {
                  email: userEmail,
                  full_name: "Active User",
                },
              },
            ] as any,
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("button", "Add Task").click();
    cy.contains('[role="dialog"]', "Add Task").should("exist");
  });

  it("opens milestone dialog from Add Milestone action", () => {
    const userEmail = store.getState().user.userDetail.email;

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [
              {
                is_active: true,
                staff_id: 10,
                staff: {
                  email: userEmail,
                  full_name: "Active User",
                },
              },
            ] as any,
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("button", "Add Milestone").click();
    cy.contains('[role="dialog"]', "Add Milestone").should("exist");
  });

  it("does not render suspended warning when work phase is active", () => {
    const activePhase = {
      work_phase: {
        ...selectedWorkPhase.work_phase,
        is_suspended: false,
      },
    } as any;

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [activePhase],
            selectedWorkPhase: activePhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("The Work is suspended").should("not.exist");
  });

  it("syncs selected work phase when current work phase id is present", () => {
    const setSelectedWorkPhase = cy.stub().as("setSelectedWorkPhase");
    const phaseOne = {
      work_phase: {
        ...selectedWorkPhase.work_phase,
        id: 11,
        name: "Planning",
      },
    } as any;
    const phaseTwo = {
      work_phase: {
        ...selectedWorkPhase.work_phase,
        id: 12,
        name: "Readiness",
      },
    } as any;

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [phaseOne, phaseTwo],
            selectedWorkPhase: phaseOne,
            setSelectedWorkPhase,
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.get("@setSelectedWorkPhase").should("have.been.calledWith", phaseTwo);
  });

  it("deletes selected task rows from the bulk action bar", () => {
    cy.stub(taskEventService, "deleteTasks")
      .as("deleteTasks")
      .resolves({ status: 200 } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Submit package")
      .parents("tr")
      .first()
      .find('input[type="checkbox"]')
      .check({ force: true });

    cy.contains("selected").should("exist");
    cy.contains("button", "Delete").click({ force: true });
    cy.contains('[role="dialog"]', "Delete").within(() => {
      cy.contains("button", "Yes").click({ force: true });
    });

    cy.get("@deleteTasks").should("have.been.called");
  });

  it("opens a task from row click", () => {
    const userEmail = store.getState().user.userDetail.email;

    cy.stub(workService, "getWorkTeamMembers")
      .as("getWorkTeamMembers")
      .resolves({
        status: 200,
        data: [
          {
            staff: {
              id: 10,
              full_name: "Active User",
            },
          },
        ],
      } as any);

    cy.stub(taskEventService, "getById")
      .as("getTaskById")
      .resolves({
        status: 200,
        data: {
          id: 101,
          name: "Submit package",
          assignees: [],
          responsibilities: [],
          notes: '{"blocks":[],"entityMap":{}}',
        },
      } as any);
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [
              {
                is_active: true,
                staff_id: 10,
                staff: {
                  email: userEmail,
                  full_name: "Active User",
                },
              },
            ] as any,
            work: {
              id: 101,
              ea_act_id: 1,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Submit package").click({ force: true });
    cy.get("@getTaskById").should("have.been.calledWith", 101);
    cy.contains('[role="dialog"]', "Submit package").should("exist");
    cy.get("@getWorkTeamMembers").should("have.been.called");
  });

  it("cleans up selected phase state on unmount when template prompt is shown", () => {
    const setSelectedWorkPhase = cy.stub().as("setSelectedWorkPhase");

    (workService.checkTemplateUploadStatus as any).resolves({
      status: 200,
      data: {
        template_available: true,
        task_added: false,
      },
    } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase,
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.mount(<div data-cy="unmounted" />);
    cy.get("@setSelectedWorkPhase").should("have.been.calledWith", undefined);
  });

  it("imports tasks from template after confirmation", () => {
    (workService.checkTemplateUploadStatus as any).resolves({
      status: 200,
      data: {
        template_available: true,
        task_added: false,
      },
    } as any);

    cy.stub(templateService, "getTemplatesByParams")
      .as("getTemplatesByParams")
      .resolves({
        status: 200,
        data: [
          {
            id: 901,
            name: "Readiness Template",
            is_active: true,
          },
        ],
      } as any);

    cy.stub(templateService, "getTemplateTasks")
      .as("getTemplateTasks")
      .resolves({
        status: 200,
        data: [
          {
            id: 1,
            name: "Prepare Package",
          },
        ],
      } as any);

    cy.stub(taskEventService, "importTasksFromTemplate")
      .as("importTasksFromTemplate")
      .resolves({ status: 201 } as any);

    const userEmail = store.getState().user.userDetail.email;

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [
              {
                is_active: true,
                staff_id: 10,
                staff: {
                  email: userEmail,
                  full_name: "Active User",
                },
              },
            ] as any,
            work: {
              id: 101,
              ea_act_id: 1,
              work_type_id: 2,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.get("@checkTemplateUploadStatus").should("have.been.called");
    cy.contains("button", "Add Milestone")
      .parent()
      .within(() => {
        cy.get("button .icon").first().parent("button").click();
      });
    cy.contains('[role="dialog"]', "Task Template").should("exist");

    cy.get("@getTemplatesByParams").should("have.been.called");
    cy.get("@getTemplateTasks").should("have.been.calledWith", 901);

    cy.get("#import-tasks-form").submit();
    cy.contains('[role="dialog"]', "Upload this Template?").within(() => {
      cy.contains("button", "Upload").click();
    });

    cy.get("@importTasksFromTemplate").should(
      "have.been.calledWith",
      { work_phase_id: 12 },
      901,
    );
  });

  it("shows an error notification when milestone details fail to load", () => {
    (eventService.getMilestoneEvents as any).resolves({
      status: 200,
      data: [
        {
          id: 808,
          name: "Optional Milestone",
          anticipated_date: "2026-03-12T00:00:00.000Z",
          actual_date: null,
          event_configuration: {
            visibility: "OPTIONAL",
            event_position: "INTERMEDIATE",
          },
        },
      ],
    } as any);

    cy.stub(eventService, "getById")
      .as("getMilestoneById")
      .rejects(new Error("boom"));

    const userEmail = store.getState().user.userDetail.email;

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [
              {
                is_active: true,
                staff_id: 10,
                staff: {
                  email: userEmail,
                  full_name: "Active User",
                },
              },
            ] as any,
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Optional Milestone").click({ force: true });
    cy.get("@getMilestoneById").should("have.been.called");
    cy.contains(COMMON_ERROR_MESSAGE).should("exist");
  });

  it("shows an error notification when task details fail to load", () => {
    cy.stub(taskEventService, "getById")
      .as("getTaskById")
      .rejects(new Error("boom"));

    const userEmail = store.getState().user.userDetail.email;

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [
              {
                is_active: true,
                staff_id: 10,
                staff: {
                  email: userEmail,
                  full_name: "Active User",
                },
              },
            ] as any,
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Submit package").click({ force: true });
    cy.get("@getTaskById").should("have.been.called");
    cy.contains(COMMON_ERROR_MESSAGE).should("exist");
  });

  it("applies bulk assign updates", () => {
    cy.stub(taskEventService, "patchTasks")
      .as("patchTasks")
      .resolves({ status: 200 } as any);

    const userEmail = store.getState().user.userDetail.email;

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [
              {
                is_active: true,
                staff_id: 10,
                staff: {
                  email: userEmail,
                  full_name: "Active User",
                  first_name: "Active",
                  last_name: "User",
                },
              },
            ] as any,
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Submit package")
      .parents("tr")
      .first()
      .find('input[type="checkbox"]')
      .check({ force: true });

    cy.contains("Assign To").click({ force: true });
    cy.contains("Active User").click({ force: true });
    cy.contains("Apply").click({ force: true });

    cy.get("@patchTasks").should("have.callCount", 1);
    cy.get("@patchTasks")
      .its("firstCall.args.0")
      .should("include", { work_id: 101 });
  });

  it("shows template available notification when templates are available", () => {
    (workService.checkTemplateUploadStatus as any).resolves({
      status: 200,
      data: {
        template_available: true,
        task_added: false,
      },
    } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Task Templates are available!").should("exist");
  });

  it("handles responsibility load failures without breaking event list rendering", () => {
    (responsibilityService.getResponsibilities as any).rejects(
      new Error("network error"),
    );

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Submit package").should("exist");
    cy.contains("button", "Add Task").should("exist");
  });

  it("does not show template available notification when tasks were already imported", () => {
    (workService.checkTemplateUploadStatus as any).resolves({
      status: 200,
      data: {
        template_available: true,
        task_added: true,
      },
    } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [],
            work: {
              id: 101,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Task Templates are available!").should("not.exist");
  });

  it("returns to template list when upload confirmation is cancelled", () => {
    (workService.checkTemplateUploadStatus as any).resolves({
      status: 200,
      data: {
        template_available: true,
        task_added: false,
      },
    } as any);

    cy.stub(templateService, "getTemplatesByParams")
      .as("getTemplatesByParams")
      .resolves({
        status: 200,
        data: [
          {
            id: 901,
            name: "Readiness Template",
            is_active: true,
          },
        ],
      } as any);

    cy.stub(templateService, "getTemplateTasks")
      .as("getTemplateTasks")
      .resolves({
        status: 200,
        data: [{ id: 1, name: "Prepare Package" }],
      } as any);

    const userEmail = store.getState().user.userDetail.email;

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            team: [
              {
                is_active: true,
                staff_id: 10,
                staff: {
                  email: userEmail,
                  full_name: "Active User",
                },
              },
            ] as any,
            work: {
              id: 101,
              ea_act_id: 1,
              work_type_id: 2,
              title: "Bridge Work",
              current_work_phase_id: 12,
              project: {
                name: "Bridge Project",
              },
            } as any,
            workPhases: [selectedWorkPhase],
            selectedWorkPhase,
            setSelectedWorkPhase: cy.stub(),
            setWork: cy.stub(),
            setWorkPhases: cy.stub(),
          }}
        >
          <EventProvider>
            <EventList />
          </EventProvider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("button", "Add Milestone")
      .parent()
      .within(() => {
        cy.get("button .icon").first().parent("button").click();
      });

    cy.contains('[role="dialog"]', "Task Template").should("exist");
    cy.get("#import-tasks-form").submit();
    cy.contains('[role="dialog"]', "Upload this Template?").should("exist");
    cy.contains('[role="dialog"]', "Upload this Template?").within(() => {
      cy.contains("button", "Cancel").click({ force: true });
    });
    cy.contains('[role="dialog"]', "Task Template").should("exist");
  });
});
