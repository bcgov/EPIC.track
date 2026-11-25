import EventForm from "../EventForm";
import { EventProvider } from "../EventContext";
import { AppConfig } from "config";
import { EventPosition } from "models/event";
import { EventCategory, EventType } from "api/events/ids";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";
import { eventsApi } from "api/events";
import { ApiError } from "apiManager/apiError";
import staffService from "services/staffService/staffService";
import { workPhasesApi } from "api/workPhases";
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
      // EventResponseSchema always nests the event configuration.
      body: {
        id: 77,
        name: "Decision issued updated",
        event_configuration_id: 9,
        event_configuration: {
          id: 9,
          name: "Decision Milestone",
          event_category_id: EventCategory.MILESTONE,
          event_type_id: 1,
          multiple_days: false,
          event_position: EventPosition.INTERMEDIATE,
          visibility: "OPTIONAL",
          work_phase_id: 55,
          start_at: null,
        },
      },
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
    visibility: "OPTIONAL",
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

    cy.stub(eventsApi, "listActSections").resolves([
      { id: 1, name: "Section 1" },
    ]);

    cy.stub(workPhasesApi, "getInfo").resolves(undefined);
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
    cy.stub(eventsApi, "update")
      .as("updateMilestoneDirect")
      .resolves({ id: 77 } as any);

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

    cy.stub(eventsApi, "listOutcomes")
      .as("getOutcomeConfigurations")
      .resolves([{ id: 5, name: "Approved" }]);

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

    cy.stub(eventsApi, "listOutcomes")
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
    cy.stub(eventsApi, "listConfigurations")
      .as("getConfigurations")
      .resolves([
        {
          id: 301,
          name: "Resume Clock",
          event_category_id: EventCategory.MILESTONE,
          event_type_id: EventType.TIME_LIMIT_RESUMPTION,
          multiple_days: false,
          event_position: EventPosition.INTERMEDIATE,
        },
      ] as any);

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
    cy.stub(eventsApi, "listConfigurations")
      .as("getConfigurations")
      .resolves([
        {
          id: 302,
          name: "Optional Milestone",
          event_category_id: EventCategory.MILESTONE,
          event_type_id: EventType.SUBMISSION,
          multiple_days: false,
          event_position: EventPosition.INTERMEDIATE,
        },
      ] as any);

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
    (workPhasesApi.getInfo as any).resolves({ milestone_progress: 0 });

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
  it("creates a milestone through eventsApi with the phase id and push flag", () => {
    cy.stub(eventsApi, "listConfigurations").resolves([
      {
        id: 301,
        name: "Resume Clock",
        event_category_id: EventCategory.MILESTONE,
        event_type_id: EventType.TIME_LIMIT_RESUMPTION,
        multiple_days: false,
        event_position: EventPosition.INTERMEDIATE,
      },
    ] as any);
    cy.stub(eventsApi, "checkDatePush").resolves({
      phase_end_push_required: false,
      subsequent_event_push_required: false,
      days_pushed: 0,
    });
    cy.stub(eventsApi, "create")
      .as("create")
      .resolves({ id: 501 } as any);
    const onSave = cy.stub().as("onSave");

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
          <EventForm onSave={onSave} isFormFieldsLocked={false} />
        </EventProvider>
      </WorkplanContext.Provider>,
    );

    cy.get('input[placeholder="Title"]').should("have.value", "Resume Clock");
    cy.get("#event-form").submit();

    cy.get("@create").should("have.been.calledOnce");
    cy.get("@create")
      .its("firstCall.args")
      .then(([workPhaseId, input, pushEvents]) => {
        expect(workPhaseId).to.equal(55);
        expect(input.name).to.equal("Resume Clock");
        // The select holds its value as a string, which the API parses.
        expect(Number(input.event_configuration_id)).to.equal(301);
        expect(pushEvents).to.equal(false);
      });
    cy.get("@onSave").should("have.been.called");
  });

  describe("closing a legislated phase over its time limit", () => {
    const endEvent = {
      ...baseEvent,
      event_configuration: {
        ...baseEvent.event_configuration,
        event_position: EventPosition.END,
      },
    } as any;
    const timeLimitExtension = {
      id: 7,
      name: "s.38 Extension of Time Limit",
      event_category_id: EventCategory.EXTENSION,
      event_type_id: EventType.TIME_LIMIT_EXTENSION,
      multiple_days: false,
      event_position: EventPosition.INTERMEDIATE,
    };

    const mountEnd = () => {
      cy.stub(eventsApi, "checkDatePush").as("check").resolves({
        phase_end_push_required: false,
        subsequent_event_push_required: false,
        days_pushed: 0,
        extension_days_required: 5,
      });
      cy.mount(
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            work: { id: 101, ea_act_id: 3 } as any,
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
      cy.get("#actual_date")
        .parents(".MuiFormControl-root")
        .first()
        .find("button")
        .click();
      cy.contains('[role="gridcell"]', /^22$/).click();
      cy.get("@check").should("have.been.called");
      cy.get("#event-form").submit();
    };

    it("adds the extension first, then saves the END with the date it pushed", () => {
      cy.stub(eventsApi, "listConfigurations").resolves([
        timeLimitExtension,
      ] as any);
      cy.stub(eventsApi, "create")
        .as("create")
        .resolves({ id: 900 } as any);
      cy.stub(eventsApi, "get")
        .as("get")
        .resolves({
          ...endEvent,
          anticipated_date: "2026-03-27T00:00:00.000Z",
        });
      cy.stub(eventsApi, "update")
        .as("update")
        .resolves({ ...endEvent } as any);

      mountEnd();

      cy.contains(
        '[role="dialog"]',
        "Add the extension and lock this Milestone?",
      ).should("exist");
      cy.get('[data-cy="overage-extension-summary"]').should(
        "contain.text",
        "5 days over its time limit",
      );
      cy.contains('[role="dialog"] button', "Add extension and lock").should(
        "be.disabled",
      );
      cy.get('[data-cy="overage-act-section"] input')
        .click({ force: true })
        .type("Section 1{enter}", { force: true });
      cy.get('[data-cy="overage-reason"] textarea')
        .first()
        .type("Signed with the decision");
      cy.contains('[role="dialog"] button', "Add extension and lock").click();

      cy.get("@create").should("have.been.calledOnce");
      cy.get("@update").should("have.been.calledOnce");
      cy.get("@get").should("have.been.calledWith", 77);
      cy.get("@create").then((create: any) => {
        cy.get("@update").then((update: any) => {
          expect(create).to.have.been.calledBefore(update);
          const [workPhaseId, extension, pushEvents] = create.firstCall.args;
          const [eventId, end] = update.firstCall.args;
          expect(workPhaseId).to.equal(55);
          expect(pushEvents).to.equal(true);
          expect(extension).to.include({
            name: "s.38 Extension of Time Limit",
            event_configuration_id: 7,
            number_of_days: 5,
            act_section_id: 1,
            reason: "Signed with the decision",
          });
          expect(eventId).to.equal(77);
          expect(extension.actual_date).to.equal(String(end.actual_date));
          expect(extension.anticipated_date).to.equal(String(end.actual_date));
          expect(end.anticipated_date).to.equal("2026-03-27T00:00:00.000Z");
        });
      });
    });

    it("adds the extension only once when the END save fails and is retried", () => {
      cy.stub(eventsApi, "listConfigurations").resolves([
        timeLimitExtension,
      ] as any);
      cy.stub(eventsApi, "create")
        .as("create")
        .resolves({ id: 900 } as any);
      cy.stub(eventsApi, "get").resolves({
        ...endEvent,
        anticipated_date: "2026-03-27T00:00:00.000Z",
      });
      const update = cy.stub(eventsApi, "update").as("update");
      update.onFirstCall().rejects(
        new ApiError({
          client: "track",
          status: 422,
          code: "UnprocessableEventError",
          message: "The milestone date is outside the phase.",
        }),
      );
      update.onSecondCall().resolves({ ...endEvent } as any);

      mountEnd();
      cy.get('[data-cy="overage-act-section"] input')
        .click({ force: true })
        .type("Section 1{enter}", { force: true });
      cy.contains('[role="dialog"] button', "Add extension and lock").click();
      cy.contains(
        '[role="dialog"]',
        "The milestone date is outside the phase.",
      ).should("exist");
      cy.contains('[role="dialog"] button', "Go Back").click();
      cy.get("#event-form").submit();
      cy.contains('[role="dialog"]', "Lock this Milestone?").should("exist");
      cy.contains('[role="dialog"] button', "Yes").click();

      cy.get("@update").should("have.been.calledTwice");
      cy.get("@create").should("have.been.calledOnce");
      cy.get("@update").then((update: any) => {
        expect(update.firstCall.args[1].anticipated_date).to.equal(
          "2026-03-27T00:00:00.000Z",
        );
        expect(update.secondCall.args[1].anticipated_date).to.equal(
          "2026-03-27T00:00:00.000Z",
        );
      });
    });

    it("says so and saves nothing when the phase has no extension milestone", () => {
      cy.stub(eventsApi, "listConfigurations").resolves([]);
      cy.stub(eventsApi, "create").as("create");
      cy.stub(eventsApi, "update").as("update");

      mountEnd();
      cy.get('[data-cy="overage-act-section"] input')
        .click({ force: true })
        .type("Section 1{enter}", { force: true });
      cy.contains('[role="dialog"] button', "Add extension and lock").click();

      cy.contains(
        '[role="dialog"]',
        "This phase has no Time Limit Extension milestone to add.",
      ).should("exist");
      cy.get("@create").should("not.have.been.called");
      cy.get("@update").should("not.have.been.called");
    });
  });

  it("shows the server's message in the lock dialog when the save is rejected", () => {
    cy.stub(eventsApi, "checkDatePush").resolves({
      phase_end_push_required: false,
      subsequent_event_push_required: false,
      days_pushed: 0,
    });
    cy.stub(eventsApi, "update")
      .as("update")
      .rejects(
        new ApiError({
          client: "track",
          status: 422,
          code: "UnprocessableEventError",
          message: "The milestone date is outside the phase.",
        }),
      );

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
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
            event={baseEvent}
            isFormFieldsLocked={false}
          />
        </EventProvider>
      </WorkplanContext.Provider>,
    );

    // Typing is reset by the field's onDateChange, so pick from the calendar.
    cy.get("#actual_date")
      .parents(".MuiFormControl-root")
      .first()
      .find("button")
      .click();
    cy.contains('[role="gridcell"]', /^22$/).click();
    cy.get("#event-form").submit();
    cy.contains("Lock this Milestone?").should("exist");
    cy.contains('[role="dialog"] button', "Yes").click();

    cy.get("@update").should("have.been.calledOnce");
    // In the dialog, not just the snackbar the other error branch uses.
    cy.contains('[role="dialog"]', "Lock this Milestone?").should(
      "contain.text",
      "The milestone date is outside the phase.",
    );
    cy.contains('[role="dialog"] button', "Go Back").should("exist");
  });
});
