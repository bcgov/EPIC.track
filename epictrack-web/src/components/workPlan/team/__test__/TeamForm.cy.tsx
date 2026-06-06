import { AppConfig } from "config";
import TeamForm from "../TeamForm";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "getAllStaff",
    method: "GET",
    url: `${AppConfig.apiUrl}staffs*`,
    response: {
      body: [
        {
          id: 1,
          full_name: "Alex Johnson",
          email: "alex@example.com",
          phone: "250-555-0101",
        },
      ],
    },
  },
  {
    name: "getRoles",
    method: "GET",
    url: `${AppConfig.apiUrl}roles*`,
    response: {
      body: [
        { id: 1, name: "Team Lead" },
        { id: 2, name: "Member" },
      ],
    },
  },
];

describe("TeamForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("loads team form controls", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: {
            id: 101,
          } as any,
        }}
      >
        <TeamForm onSave={() => {}} />
      </WorkplanContext.Provider>,
    );

    cy.wait("@getAllStaff");
    cy.wait("@getRoles");

    cy.contains("Name").should("exist");
    cy.contains("Email").should("exist");
    cy.contains("Phone").should("exist");
    cy.contains("Role").should("exist");
    cy.contains("Active").should("exist");
  });
});
