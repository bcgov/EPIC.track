import {
  WorkplanContext,
  initialWorkPlanContext,
} from "components/workPlan/WorkPlanContext";
import { AboutContext } from "../../../AboutContext";
import { BrowserRouter } from "react-router-dom";
import { Work } from "models/work";

import ProjectDetails from "..";
import {
  generateMockProjectSummary,
  generateMockWork,
} from "../../../../../../../cypress/support/mocks";
import dayjs from "dayjs";
import { MONTH_DAY_YEAR } from "constants/application-constant";
import { AppConfig } from "config";
import { store } from "store";
import { projectsQueryApi } from "api/projects";

const mockWork: Work = {
  ...generateMockWork(),
  is_active: true,
};
const mockProject = {
  ...generateMockProjectSummary(),
  id: mockWork.project_id,
};
const projectUrl = `${AppConfig.apiUrl}projects/${mockWork.project_id}`;

const initContextWrapper = () => {
  const ContextWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            isActiveTeamMember: true,
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
    store.dispatch(projectsQueryApi.util.resetApiState());
    cy.intercept("GET", projectUrl, { body: mockProject }).as("project");
    cy.mount(
      <ContextWrapper>
        <ProjectDetails />
      </ContextWrapper>,
    );
  });

  it("Project Details are displayed", () => {
    cy.wait("@project");
    cy.get("p").contains(mockProject.proponent.name).should("be.visible");
    cy.get("p").contains(mockProject.description).should("be.visible");
    cy.get("p").contains(mockProject.type.name).should("be.visible");
    cy.get("p").contains(mockProject.address).should("be.visible");
    cy.get("p").contains(mockProject.region_env.name).should("be.visible");
    cy.get("p").contains(mockProject.region_flnro.name).should("be.visible");
    cy.get("p").contains(mockProject.abbreviation).should("be.visible");
    cy.get("p")
      .contains(dayjs(mockProject.created_at).format(MONTH_DAY_YEAR))
      .should("be.visible");
  });

  it("tells the user when the project can't be loaded", () => {
    store.dispatch(projectsQueryApi.util.resetApiState());
    cy.intercept("GET", projectUrl, { statusCode: 500, body: {} });
    cy.mount(
      <ContextWrapper>
        <ProjectDetails />
      </ContextWrapper>,
    );
    cy.contains("Couldn't load project details").should("exist");
  });

  it("opens project dialog when edit is clicked", () => {
    cy.contains("button", "Edit").click();
    cy.get('[role="dialog"]').should("exist");
  });

  it("renders nothing when work is not available", () => {
    cy.mount(
      <BrowserRouter>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            work: undefined,
          }}
        >
          <AboutContext.Provider value={{} as any}>
            <ProjectDetails />
          </AboutContext.Provider>
        </WorkplanContext.Provider>
      </BrowserRouter>,
    );

    cy.contains("PROJECT CREATION DATE").should("not.exist");
  });
});
