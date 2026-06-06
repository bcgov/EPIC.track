import { MemoryRouter as Router } from "react-router-dom";
import WorkList from "../WorkList";
import { workService } from "services/workService/workService";
import { store } from "store";
import { userDetails } from "services/userService/userSlice";
import { ROLES } from "constants/application-constant";
import { All_WORKS_FILTERS_CACHE_KEY } from "../constants";

const dispatchRoles = (roles: string[]) => {
  store.dispatch(
    userDetails({
      sub: "123",
      groups: [],
      preferred_username: "tester",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      staffId: 1,
      phone: "",
      position: "",
      roles,
    }),
  );
};

const mountWorkList = (
  works: any[],
  roles: string[] = [],
  cachedFilters?: { id: string; value: unknown[] }[],
) => {
  dispatchRoles(roles);
  cy.then(() => {
    sessionStorage.clear();
    if (cachedFilters) {
      sessionStorage.setItem(
        All_WORKS_FILTERS_CACHE_KEY,
        JSON.stringify(cachedFilters),
      );
    }
  });

  cy.then(() => {
    cy.stub(workService, "getAll").resolves({
      status: 200,
      data: works,
    } as any);

    cy.mount(
      <Router>
        <WorkList />
      </Router>,
    );
  });
};

describe("WorkList core behavior", () => {
  it("renders normalized work-state labels and status chips", () => {
    dispatchRoles([]);

    cy.stub(workService, "getAll").resolves({
      status: 200,
      data: [
        {
          id: 1,
          title: "Alpha Work",
          work_state: "IN_PROGRESS",
          is_active: true,
          project: { name: "Project A" },
          ea_act: { name: "2018" },
          work_type: { name: "EA" },
          eao_team: { name: "Team One" },
          current_work_phase: { name: "Review" },
        },
        {
          id: 2,
          title: "Beta Work",
          work_state: "IN_PROGRESS",
          is_active: false,
          project: { name: "Project B" },
          ea_act: { name: "2002" },
          work_type: { name: "Amendment" },
          eao_team: { name: "Team Two" },
          current_work_phase: { name: "Decision" },
        },
      ],
    } as any);

    cy.mount(
      <Router>
        <WorkList />
      </Router>,
    );

    cy.contains("Alpha Work").should("exist");
    cy.contains("Beta Work").should("exist");
    cy.contains("In Progress").should("exist");
    cy.contains("Active").should("exist");
    cy.contains("Inactive").should("exist");
  });

  it("shows a disabled Create Work button when user lacks create role", () => {
    dispatchRoles([]);

    cy.stub(workService, "getAll").resolves({
      status: 200,
      data: [],
    } as any);

    cy.mount(
      <Router>
        <WorkList />
      </Router>,
    );

    cy.contains("button", "Create Work").should("be.disabled");
  });

  it("shows an enabled Create Work button when user has create role", () => {
    dispatchRoles([ROLES.CREATE]);

    cy.stub(workService, "getAll").resolves({
      status: 200,
      data: [],
    } as any);

    cy.mount(
      <Router>
        <WorkList />
      </Router>,
    );

    cy.contains("button", "Create Work").should("not.be.disabled");
  });

  it("shows notification when works API returns a non-200 response", () => {
    dispatchRoles([]);

    cy.stub(workService, "getAll").resolves({
      status: 500,
      data: [],
    } as any);

    cy.mount(
      <Router>
        <WorkList />
      </Router>,
    );

    cy.contains("Could not load Works").should("exist");
  });

  it("renders unknown work-state values without remapping", () => {
    mountWorkList(
      [
        {
          id: 1,
          title: "Alpha Work",
          work_state: "IN_PROGRESS",
          is_active: true,
          project: { name: "Project A" },
          ea_act: { name: "2018" },
          work_type: { name: "EA" },
          eao_team: { name: "Team One" },
          current_work_phase: { name: "Review" },
        },
        {
          id: 2,
          title: "Gamma Work",
          work_state: "ARCHIVED_CUSTOM",
          is_active: true,
          project: null,
          ea_act: null,
          work_type: null,
          eao_team: null,
          current_work_phase: null,
        },
      ],
      [],
      [],
    );

    cy.contains("Alpha Work").should("exist");
    cy.contains("Gamma Work").should("exist");
    cy.contains("ARCHIVED_CUSTOM").should("exist");
  });
});
