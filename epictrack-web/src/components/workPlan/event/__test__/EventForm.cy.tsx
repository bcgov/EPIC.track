import EventForm from "../EventForm";
import { EventProvider } from "../EventContext";
import { AppConfig } from "config";
import { EventCategory, EventPosition, EventType } from "models/event";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";
import { eventService } from "services/eventService/eventService";
import { actSectionService } from "services/actSectionService/actSectionService";
import staffService from "services/staffService/staffService";
import { outcomeConfigurationService } from "services/outcomeConfigurationService/outcomeConfigurationService";
import { configurationService } from "services/configurationService/configurationService";
import { workService } from "services/workService/workService";
import {
  WorkplanContext,
  initialWorkPlanContext,
} from "components/workPlan/WorkPlanContext";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";

const endpoints: Endpoint[] = [
  {
    name: "updateMilestone",
    method: "PUT",
    url: `${AppConfig.apiUrl}milestones/events/77*`,
    response: {
      body: { id: 77 },
    },
  },
];

const existingEvent = {
  id: 77,
  name: "Decision issued",
  event_configuration_id: 9,
  event_configuration: {
    id: 9,
    name: "Decision Milestone",
    event_category_id: EventCategory.MILESTONE,
    event_type_id: 1,
    multiple_days: false,
    event_position: EventPosition.INTERMEDIATE,
    visibilty_mode: "OPTIONAL",
    work_phase_id: 55,
  },
  anticipated_date: "2026-03-20T00:00:00.000Z",
  actual_date: "2026-03-22T00:00:00.000Z",
  notes: '{"blocks":[],"entityMap":{}}',
  description: "Initial milestone description",
  high_priority: false,
  number_of_days: 0,
} as any;

const baseEvent = {
  ...existingEvent,
  actual_date: null,
} as any;

describe("EventForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);

    cy.stub(actSectionService, "getActSectionsByEaAct").resolves({
      status: 200,
      data: [{ id: 1, name: "Section 1" }],
    } as any);

    cy.stub(workService, "getWorkPhaseAdditionalInfo").resolves({
      status: 200,
      data: [],
    } as any);
  });

  it("submits updated milestone details", () => {
    const onSave = cy.stub().as("onSave");

    cy.mount(
      <EventProvider>
        <EventForm
          onSave={onSave}
          event={existingEvent}
          isFormFieldsLocked={false}
        />
      </EventProvider>,
    );

    cy.get('input[placeholder="Title"]')
      .clear()
      .type("Decision issued updated");
    cy.get("#event-form").submit();

    cy.wait("@updateMilestone");
    cy.get("@onSave").should("have.been.called");
  });

  it("submits an unlocked milestone update when actual date is not provided", () => {
    cy.stub(eventService, "update")
      .as("updateMilestoneDirect")
      .resolves({ status: 200, data: { id: 77 } } as any);

    const onSave = cy.stub().as("onSave");

    cy.mount(
      <EventProvider>
        <EventForm
          onSave={onSave}
          event={baseEvent}
          isFormFieldsLocked={false}
        />
      </EventProvider>,
    );

    cy.get("#event-form").submit();

    cy.get("@updateMilestoneDirect").should("have.been.calledOnce");
    cy.get("@onSave").should("have.been.called");
  });

  it("renders extension-specific fields and labels", () => {
    const extensionEvent = {
      ...baseEvent,
      event_configuration: {
        ...baseEvent.event_configuration,
        event_category_id: EventCategory.EXTENSION,
        event_type_id: EventType.SUBMISSION,
      },
    } as any;

    cy.mount(
      <EventProvider>
        <EventForm
          onSave={cy.stub()}
          event={extensionEvent}
          isFormFieldsLocked={false}
        />
      </EventProvider>,
    );

    cy.contains("Anticipated Order Date").should("exist");
    cy.contains("Actual Order Date").should("exist");
    cy.contains("Current Phase End Date").should("exist");
    cy.contains("Act Section").should("exist");
  });

  it("renders multi-day input when milestone configuration is multiple-days", () => {
    const multiDayEvent = {
      ...baseEvent,
      event_configuration: {
        ...baseEvent.event_configuration,
        event_category_id: EventCategory.MILESTONE,
        multiple_days: true,
      },
    } as any;

    cy.mount(
      <EventProvider>
        <EventForm
          onSave={cy.stub()}
          event={multiDayEvent}
          isFormFieldsLocked={false}
        />
      </EventProvider>,
    );

    cy.contains("Anticipated Start Date").should("exist");
    cy.contains("Actual Start Date").should("exist");
    cy.contains("Number of Days").should("exist");
    cy.contains("End Date").should("exist");
  });

  it("renders single-day PCP attendee input for open house events", () => {
    const openHouseEvent = {
      ...baseEvent,
      event_configuration: {
        ...baseEvent.event_configuration,
        event_category_id: EventCategory.PCP,
        event_type_id: EventType.OPEN_HOUSE,
      },
    } as any;

    cy.mount(
      <EventProvider>
        <EventForm
          onSave={cy.stub()}
          event={openHouseEvent}
          isFormFieldsLocked={false}
        />
      </EventProvider>,
    );

    cy.contains("Number of Attendees").should("exist");
  });

  it("renders PCP response fields for non-open-house PCP events", () => {
    const pcpEvent = {
      ...baseEvent,
      event_configuration: {
        ...baseEvent.event_configuration,
        event_category_id: EventCategory.PCP,
        event_type_id: EventType.COMMENT_PERIOD,
      },
    } as any;

    cy.mount(
      <EventProvider>
        <EventForm
          onSave={cy.stub()}
          event={pcpEvent}
          isFormFieldsLocked={false}
        />
      </EventProvider>,
    );

    cy.contains("Number of Responses").should("exist");
    cy.contains("Topic").should("exist");
    cy.contains("Number of Attendees").should("not.exist");
  });

  it("renders suspension-specific fields for time limit suspension events", () => {
    const suspensionEvent = {
      ...baseEvent,
      event_configuration: {
        ...baseEvent.event_configuration,
        event_category_id: EventCategory.MILESTONE,
        event_type_id: EventType.TIME_LIMIT_SUSPENSION,
      },
    } as any;

    cy.mount(
      <EventProvider>
        <EventForm
          onSave={cy.stub()}
          event={suspensionEvent}
          isFormFieldsLocked={false}
        />
      </EventProvider>,
    );

    cy.contains("Act Section").should("exist");
    cy.contains("Reason").should("exist");
  });

  it("disables key controls when form fields are locked", () => {
    cy.mount(
      <EventProvider>
        <EventForm
          onSave={cy.stub()}
          event={existingEvent}
          isFormFieldsLocked={true}
        />
      </EventProvider>,
    );

    cy.get('input[placeholder="Title"]').should("be.disabled");
    cy.get("#anticipated_date").should("be.disabled");
    cy.get("#actual_date").should("be.disabled");
  });

  it("renders decision-specific fields when decision event has an actual date", () => {
    cy.stub(staffService, "getActiveStaffByPosition")
      .as("getActiveStaffByPosition")
      .resolves({
        status: 200,
        data: [{ id: 1, full_name: "Decision Maker" }],
      } as any);

    cy.stub(outcomeConfigurationService, "getOutcomeConfigurations")
      .as("getOutcomeConfigurations")
      .resolves({
        status: 200,
        data: [{ id: 5, name: "Approved" }],
      } as any);

    const decisionEvent = {
      ...existingEvent,
      event_configuration: {
        ...existingEvent.event_configuration,
        event_category_id: EventCategory.DECISION,
      },
      actual_date: "2026-03-22T00:00:00.000Z",
    } as any;

    cy.mount(
      <EventProvider>
        <EventForm
          onSave={cy.stub()}
          event={decisionEvent}
          isFormFieldsLocked={false}
        />
      </EventProvider>,
    );

    cy.get("@getActiveStaffByPosition").should("have.been.called");
    cy.get("@getOutcomeConfigurations").should("have.been.called");
    cy.contains("Decision Maker").should("exist");
    cy.contains("Decision").should("exist");
  });

  it("shows error notification when decision outcomes fail to load", () => {
    cy.stub(staffService, "getActiveStaffByPosition")
      .as("getActiveStaffByPosition")
      .resolves({
        status: 200,
        data: [{ id: 1, full_name: "Decision Maker" }],
      } as any);

    cy.stub(outcomeConfigurationService, "getOutcomeConfigurations")
      .as("getOutcomeConfigurations")
      .rejects(new Error("boom"));

    const decisionEvent = {
      ...existingEvent,
      event_configuration: {
        ...existingEvent.event_configuration,
        event_category_id: EventCategory.DECISION,
      },
      actual_date: "2026-03-22T00:00:00.000Z",
    } as any;

    cy.mount(
      <EventProvider>
        <EventForm
          onSave={cy.stub()}
          event={decisionEvent}
          isFormFieldsLocked={false}
        />
      </EventProvider>,
    );

    cy.get("@getActiveStaffByPosition").should("have.been.called");
    cy.get("@getOutcomeConfigurations").should("have.been.called");
    cy.contains(COMMON_ERROR_MESSAGE).should("exist");
  });

  it("prefills resumption milestone config when creating in a suspended phase", () => {
    cy.stub(configurationService, "getAll")
      .as("getConfigurations")
      .resolves({
        status: 200,
        data: [
          {
            id: 301,
            name: "Resume Clock",
            event_category_id: EventCategory.MILESTONE,
            event_type_id: EventType.TIME_LIMIT_RESUMPTION,
            multiple_days: false,
            event_position: EventPosition.INTERMEDIATE,
          },
        ],
      } as any);

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: {
            id: 101,
            start_date: "2026-03-01T00:00:00.000Z",
          } as any,
          workPhases: [
            {
              work_phase: {
                id: 55,
                legislated: true,
                is_completed: false,
              },
            },
          ] as any,
          selectedWorkPhase: {
            work_phase: {
              id: 55,
              start_date: "2026-03-01T00:00:00.000Z",
              legislated: true,
              is_suspended: true,
            },
            milestone_progress: 0,
          } as any,
        }}
      >
        <EventProvider>
          <EventForm onSave={cy.stub()} isFormFieldsLocked={false} />
        </EventProvider>
      </WorkplanContext.Provider>,
    );

    cy.get("@getConfigurations").should("have.been.called");
    cy.get('input[placeholder="Title"]').should("have.value", "Resume Clock");
    cy.contains("Milestone Type").parent().find("input").should("be.disabled");
  });

  it("shows warning when suspended phase has no resumption milestone config", () => {
    cy.stub(configurationService, "getAll")
      .as("getConfigurations")
      .resolves({
        status: 200,
        data: [
          {
            id: 302,
            name: "Optional Milestone",
            event_category_id: EventCategory.MILESTONE,
            event_type_id: EventType.SUBMISSION,
            multiple_days: false,
            event_position: EventPosition.INTERMEDIATE,
          },
        ],
      } as any);

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: {
            id: 101,
            start_date: "2026-03-01T00:00:00.000Z",
          } as any,
          workPhases: [
            {
              work_phase: {
                id: 55,
                legislated: true,
                is_completed: false,
              },
            },
          ] as any,
          selectedWorkPhase: {
            work_phase: {
              id: 55,
              start_date: "2026-03-01T00:00:00.000Z",
              legislated: true,
              is_suspended: true,
            },
            milestone_progress: 0,
          } as any,
        }}
      >
        <EventProvider>
          <EventForm onSave={cy.stub()} isFormFieldsLocked={false} />
        </EventProvider>
      </WorkplanContext.Provider>,
    );

    cy.get("@getConfigurations").should("have.been.called");
    cy.contains(
      "No resumption milestone configuration found to resume the phase",
    ).should("exist");
  });

  it("disables anticipated date when selecting an end event at phase start", () => {
    (workService.getWorkPhaseAdditionalInfo as any).resolves({
      status: 200,
      data: [{ milestone_progress: 0 }],
    } as any);

    const endEvent = {
      ...baseEvent,
      event_configuration_id: 11,
      event_configuration: {
        ...baseEvent.event_configuration,
        id: 11,
        event_position: EventPosition.END,
        event_category_id: EventCategory.MILESTONE,
      },
    } as any;

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: {
            id: 101,
            start_date: "2026-03-01T00:00:00.000Z",
          } as any,
          selectedWorkPhase: {
            work_phase: {
              id: 55,
              start_date: "2026-03-01T00:00:00.000Z",
              legislated: true,
              is_suspended: false,
            },
          } as any,
        }}
      >
        <EventProvider>
          <EventForm
            onSave={cy.stub()}
            event={endEvent}
            isFormFieldsLocked={false}
          />
        </EventProvider>
      </WorkplanContext.Provider>,
    );

    cy.get("#anticipated_date").should("be.disabled");
  });
});
