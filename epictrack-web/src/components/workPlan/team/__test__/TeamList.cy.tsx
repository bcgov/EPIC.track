import { AppConfig } from "config";
import { MemoryRouter as Router } from "react-router-dom";
import TeamList from "../TeamList";
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
      body: [{ id: 5, name: "Other" }],
    },
  },
  {
    name: "getWorkTeamMember",
    method: "GET",
    url: `${AppConfig.apiUrl}works/staff-roles/501*`,
    response: {
      body: {
        id: 501,
        role_id: 5,
        role: { id: 5, name: "Other" },
        staff_id: 1,
        staff: {
          full_name: "Jordan Wells",
          email: "jordan@example.com",
          phone: "250-555-0102",
        },
        is_active: true,
      },
    },
  },
];

describe("TeamList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders team rows and opens edit dialog from row click", () => {
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            loading: false,
            isActiveTeamMember: true,
            work: { id: 101 } as any,
            setSelectedStaff: () => {},
            team: [
              {
                id: 501,
                role: { id: 5, name: "Other" },
                staff: {
                  full_name: "Jordan Wells",
                  email: "jordan@example.com",
                  phone: "250-555-0102",
                },
                status: "Active",
                is_active: true,
              },
            ] as any,
          }}
        >
          <TeamList />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Jordan Wells").should("exist");
    cy.contains("jordan@example.com").should("exist");
    cy.contains("button", "Team Member").should("exist");

    cy.contains("Jordan Wells").click();
    cy.wait("@getWorkTeamMember");
    cy.wait("@getAllStaff");
    cy.wait("@getRoles");
    cy.contains("Add Team Member").should("exist");
  });
});
