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
import { AppConfig } from "config";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../../../cypress/support/utils";

const mockWork: Work = {
  ...generateMockWork(),
  is_deleted: false,
  is_active: true,
};

// The project dialog loads these on open. Without mocks the requests reach
// the dev server, 404, and the unhandled rejections fail whichever test or
// hook happens to be running when they settle.
const projectDialogEndpoints: Endpoint[] = [
  {
    name: "getProject",
    method: "GET",
    url: `${AppConfig.apiUrl}projects/*`,
    response: { body: mockWork.project },
  },
  {
    name: "getRegions",
    method: "GET",
    url: `${AppConfig.apiUrl}regions*`,
    response: { body: [mockWork.project.region_env] },
  },
  {
    name: "getTypes",
    method: "GET",
    url: `${AppConfig.apiUrl}types`,
    response: { body: [mockWork.project.type] },
  },
  {
    name: "getProponents",
    method: "GET",
    url: `${AppConfig.apiUrl}proponents`,
    response: { body: [mockWork.project.proponent] },
  },
  {
    name: "getSubTypes",
    method: "GET",
    url: `${AppConfig.apiUrl}sub-types*`,
    response: { body: [mockWork.project.sub_type] },
  },
];

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
    cy.mount(
      <ContextWrapper>
        <ProjectDetails />
      </ContextWrapper>,
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

  it("opens project dialog when edit is clicked", () => {
    setupIntercepts(projectDialogEndpoints);
    cy.contains("button", "Edit").click();
    cy.get('[role="dialog"]').should("exist");
    cy.wait(["@getProject", "@getRegions", "@getTypes", "@getProponents"]);
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
