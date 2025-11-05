import { mount } from "cypress/react18";
import OverageResponsibilityForm from "../overageResponsibility/OverageResponsibilityForm";
import { WorkplanContext } from "components/workPlan/WorkPlanContext";
import { OverageResponsibilityEnum } from "models/phaseOverageResponsibilities";
import { WorkPhaseAdditionalInfo } from "models/work";
import { makeWorkplanContextStub } from "../../../../../cypress/support/common";

const mockWorkPhaseAdditionalInfo: WorkPhaseAdditionalInfo = {
  current_milestone: "Screening",
  days_left: -5,
  days_taken: 25,
  end_milestone: {
    actual_date: "2025-12-01",
    anticipated_date: "2025-11-15",
    name: "Decision",
  },
  is_last_phase: false,
  milestone_progress: 60,
  next_milestone: "Referral",
  total_number_of_days: 20,
  work_phase: {
    id: 123,
    name: "Screening",
    phase: { id: 1, name: "Phase 1" },
    start_date: "2025-10-01",
    end_date: "2025-12-01",
    milestone_progress: 60,
    next_milestone: "Referral",
    is_completed: false,
    is_suspended: false,
    legislated: true,
    suspended_date: "",
    number_of_days: "20",
    responsibility_notes: "Some responsibility notes",
  },
};

describe("OverageResponsibilityForm", () => {
  let onSave: Cypress.Agent<sinon.SinonSpy>;
  let ctx: ReturnType<typeof makeWorkplanContextStub>;

  const mountForm = (props = {}) => {
    mount(
      <WorkplanContext.Provider value={ctx}>
        <OverageResponsibilityForm
          onSave={onSave}
          overageResponsibilities={[]}
          daysAhead={10}
          hasOverage={true}
          isLegislated={true}
          daysTakenText="days taken"
          {...props}
        />
        <button type="submit" form="overage-responsibility-form">
          Submit
        </button>
      </WorkplanContext.Provider>,
    );
  };

  beforeEach(() => {
    // build fresh stubs for every test
    onSave = cy.stub().as("onSave");
    ctx = makeWorkplanContextStub({
      selectedWorkPhase: mockWorkPhaseAdditionalInfo,
    });
  });

  it("renders with initial data", () => {
    mountForm();
    cy.contains(
      `${mockWorkPhaseAdditionalInfo.days_taken} / ${mockWorkPhaseAdditionalInfo.total_number_of_days} days taken`,
    ).should("exist");
    cy.findByText("Overage Responsibility").should("exist");
    cy.findByText("Notes").should("exist");
    cy.get("textarea").should(
      "have.value",
      mockWorkPhaseAdditionalInfo.work_phase.responsibility_notes,
    );
  });

  it("submits selected responsibility and notes", () => {
    mountForm();

    cy.get('input[role="combobox"]').click({ force: true });
    cy.findByText(OverageResponsibilityEnum.PROPONENT).click();

    cy.get('textarea[name="notes"]').clear().type("New notes");
    cy.get('button[type="submit"]').click();
    cy.get("@onSave").should("have.been.calledWithMatch", {
      responsibility: [OverageResponsibilityEnum.PROPONENT],
      notes: "New notes",
    });
  });

  it("enforces max character limit for notes", () => {
    mountForm();

    const longText = "a".repeat(2100);
    cy.get('textarea[name="notes"]').clear().type(longText);
    cy.get('textarea[name="notes"]').invoke("val").should("have.length", 2000);
  });
});
