import {
  WorkplanContext,
  initialWorkPlanContext,
} from "components/workPlan/WorkPlanContext";
import { AboutContext } from "../../../AboutContext";
import { BrowserRouter } from "react-router-dom";
import WorkDetails from "..";
import { Work } from "models/work";

import dayjs from "dayjs";
import { MONTH_DAY_YEAR } from "constants/application-constant";
import {
  generateMockWork,
  generateMockWorkPhaseAdditionalInfo,
  generateMockWorkPhase,
} from "../../../../../../../cypress/support/mocks";

const mockWork: Work = {
  ...generateMockWork(),
  is_deleted: false,
  is_active: true,
};

const mockWorkPhaseAdditionalInfo = {
  ...generateMockWorkPhaseAdditionalInfo(),
  work_phase: {
    ...generateMockWorkPhase(),
    id: mockWork.current_work_phase_id,
  },
};

const mockWorkPhases = [mockWorkPhaseAdditionalInfo];

const initContextWrapper = () => {
  const ContextWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            work: mockWork,
            workPhases: mockWorkPhases,
          }}
        >
          <AboutContext.Provider value={{}}>{children}</AboutContext.Provider>
        </WorkplanContext.Provider>
      </BrowserRouter>
    );
  };
  return [ContextWrapper];
};

describe("About", () => {
  const [ContextWrapper] = initContextWrapper();
  beforeEach(() => {
    cy.mount(
      <ContextWrapper>
        <WorkDetails />
      </ContextWrapper>
    );
  });

  it("Work Details are displayed", () => {
    cy.get("p")
      .contains(mockWorkPhases[0].current_milestone)
      .should("be.visible");
    cy.get("p").contains(mockWorkPhases[0].next_milestone).should("be.visible");
    cy.get("p").contains(mockWork.report_description).should("be.visible");
    cy.get("p").contains(mockWork.ea_act.name).should("be.visible");
    cy.get("p")
      .contains(mockWork.federal_involvement.name)
      .should("be.visible");
    cy.get("p").contains(mockWork.substitution_act.name).should("be.visible");
    cy.get("p").contains(mockWork.ministry.name).should("be.visible");
    cy.get("p").contains(mockWork.decision_by.full_name).should("be.visible");
    cy.get("p")
      .contains(
        dayjs(mockWork.anticipated_referral_date).format(MONTH_DAY_YEAR)
      )
      .should("be.visible");
    cy.get("p")
      .contains(dayjs(mockWork.start_date).format(MONTH_DAY_YEAR))
      .should("be.visible");
  });
});
