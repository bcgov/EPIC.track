import FirstNationList from "../FirstNationList";
import { MemoryRouter as Router } from "react-router-dom";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import { projectService } from "../../../../services/projectService/projectService";
import { workService } from "../../../../services/workService/workService";
import { ACTIVE_STATUS } from "../../../../constants/application-constant";

const baseContext = {
  ...initialWorkPlanContext,
  loading: false,
  isActiveTeamMember: true,
  work: {
    id: 101,
    title: "Test Work",
    project_id: 88,
    project: {
      name: "Project 88",
    },
  } as any,
  setFirstNations: () => {
    return;
  },
};

const firstNations = [
  {
    id: 501,
    is_active: true,
    status: ACTIVE_STATUS.ACTIVE,
    indigenous_nation: {
      id: 1,
      name: "Nation One",
      pip_link: "PIP-001",
      relationship_holder: {
        id: 11,
        first_name: "Taylor",
        last_name: "Jordan",
        full_name: "Taylor Jordan",
        email: "taylor@example.com",
        phone: "250-555-0100",
        position: { name: "Analyst" },
      },
    },
    indigenous_consultation_level: {
      id: 1,
      name: "Consult",
    },
  },
] as any;

describe("FirstNationList", () => {
  it("renders list rows and opens edit dialog from nation click", () => {
    cy.stub(projectService, "checkFirstNationAvailability")
      .as("checkFirstNationAvailability")
      .resolves({ status: 200, data: { first_nation_available: true } } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...baseContext,
            firstNations,
          }}
        >
          <FirstNationList />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.get("@checkFirstNationAvailability").should("have.been.called");
    cy.contains("Nation One").should("exist");
    cy.contains("PIP Link").should("exist");
    cy.contains("Active").should("exist");

    cy.contains("Nation One").click();
    cy.contains('[role="dialog"]', "Nation One").should("exist");
    cy.contains("button", "Save").should("exist");
  });

  it("disables import button when first nation import is unavailable", () => {
    cy.stub(projectService, "checkFirstNationAvailability")
      .as("checkFirstNationAvailability")
      .resolves({
        status: 200,
        data: { first_nation_available: false },
      } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...baseContext,
            firstNations,
          }}
        >
          <FirstNationList />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.get("@checkFirstNationAvailability").should("have.been.called");
    cy.get("button .icon").first().parent("button").should("be.disabled");
  });

  it("opens import dialog when import is available", () => {
    cy.stub(projectService, "checkFirstNationAvailability")
      .as("checkFirstNationAvailability")
      .resolves({ status: 200, data: { first_nation_available: true } } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...baseContext,
            firstNations,
          }}
        >
          <FirstNationList />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.get("@checkFirstNationAvailability").should("have.been.called");
    cy.get("button .icon").first().parent("button").click();
    cy.contains('[role="dialog"]', "Import Nations").should("exist");
  });

  it("downloads first nations export when export button is clicked", () => {
    cy.stub(projectService, "checkFirstNationAvailability")
      .as("checkFirstNationAvailability")
      .resolves({ status: 200, data: { first_nation_available: true } } as any);
    cy.stub(workService, "downloadFirstNations")
      .as("downloadFirstNations")
      .resolves({ data: new ArrayBuffer(8) } as any);
    cy.window().then((win) => {
      cy.stub(win.URL, "createObjectURL")
        .as("createObjectURL")
        .returns("blob:mock-export");
    });

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...baseContext,
            firstNations,
          }}
        >
          <FirstNationList />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.get("@checkFirstNationAvailability").should("have.been.called");
    cy.get("button .icon").eq(1).parent("button").click();

    cy.get("@downloadFirstNations").should("have.been.calledWith", 101);
    cy.get("@createObjectURL").should("have.been.called");
  });

  it("renders empty-state actions when no first nations exist", () => {
    cy.stub(projectService, "checkFirstNationAvailability")
      .as("checkFirstNationAvailability")
      .resolves({ status: 200, data: { first_nation_available: true } } as any);

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...baseContext,
            firstNations: [],
          }}
        >
          <FirstNationList />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.get("@checkFirstNationAvailability").should("have.been.called");
    cy.contains("You don't have any First Nations yet").should("exist");
    cy.contains("button", "Add Nation").click();
    cy.contains('[role="dialog"]', "Add Nation").should("exist");
  });
});
