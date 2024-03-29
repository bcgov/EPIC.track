import {
  WorkplanContext,
  initialWorkPlanContext,
} from "components/workPlan/WorkPlanContext";
import { AboutContext } from "../../../AboutContext";
import { BrowserRouter } from "react-router-dom";
import { Work } from "models/work";

import ProjectDetails from "..";
import { generateMockWork } from "../../../../../../../cypress/support/mocks";
import dayjs from "dayjs";
import { MONTH_DAY_YEAR } from "constants/application-constant";

const mockWork: Work = {
  ...generateMockWork(),
  is_deleted: false,
  is_active: true,
};

const initContextWrapper = () => {
  const ContextWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            work: mockWork,
          }}
        >
          <AboutContext.Provider value={{}}>{children}</AboutContext.Provider>
        </WorkplanContext.Provider>
      </BrowserRouter>
    );
  };
  return [ContextWrapper];
};

describe("About Project", () => {
  const [ContextWrapper] = initContextWrapper();
  beforeEach(() => {
    cy.mount(
      <ContextWrapper>
        <ProjectDetails />
      </ContextWrapper>
    );
  });

  it("Project Details are displayed", () => {
    cy.get("p").contains(mockWork.project.proponent.name).should("be.visible");
    cy.get("p").contains(mockWork.project.description).should("be.visible");
    cy.get("p").contains(mockWork.project.type.name).should("be.visible");
    cy.get("p").contains(mockWork.project.address).should("be.visible");
    cy.get("p").contains(mockWork.project.region_env.name).should("be.visible");
    cy.get("p")
      .contains(mockWork.project.region_flnro.name)
      .should("be.visible");
    cy.get("p").contains(mockWork.project.abbreviation).should("be.visible");
    cy.get("p")
      .contains(dayjs(mockWork.project.created_at).format(MONTH_DAY_YEAR))
      .should("be.visible");
  });
});
