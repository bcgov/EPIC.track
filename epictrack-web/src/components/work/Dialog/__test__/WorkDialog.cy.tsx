import { AppConfig } from "config";
import { WorkDialog } from "..";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "getEaActs",
    method: "GET",
    url: `${AppConfig.apiUrl}ea-acts`,
    response: { body: [{ id: 1, name: "EA Act" }] },
  },
  {
    name: "getMinistries",
    method: "GET",
    url: `${AppConfig.apiUrl}ministries`,
    response: { body: [{ id: 1, name: "Ministry A" }] },
  },
  {
    name: "getWorkTypes",
    method: "GET",
    url: `${AppConfig.apiUrl}work-types`,
    response: { body: [{ id: 1, name: "Type A", sort_order: 1 }] },
  },
  {
    name: "getFederalActs",
    method: "GET",
    url: `${AppConfig.apiUrl}federal-involvements`,
    response: { body: [{ id: 1, name: "Federal A" }] },
  },
  {
    name: "getEaoTeams",
    method: "GET",
    url: `${AppConfig.apiUrl}eao-teams`,
    response: { body: [{ id: 1, name: "Team A", is_active: true }] },
  },
  {
    name: "getSubstitutionActs",
    method: "GET",
    url: `${AppConfig.apiUrl}substitution-acts`,
    response: { body: [{ id: 1, name: "None" }] },
  },
  {
    name: "getStaffsPosition",
    method: "GET",
    url: `${AppConfig.apiUrl}staffs?positions*`,
    response: {
      body: [{ id: 1, full_name: "Alex Johnson", position: { id: 1 } }],
    },
  },
  {
    name: "getProjectsListType",
    method: "GET",
    url: `${AppConfig.apiUrl}projects?return_type=list_type`,
    response: { body: [{ id: 1, name: "Project A" }] },
  },
  {
    name: "getProjectsAll",
    method: "GET",
    url: `${AppConfig.apiUrl}projects/*`,
    response: { body: { description: "desc" } },
  },
];

describe("WorkDialog", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders create work dialog and closes on cancel", () => {
    const setOpen = cy.stub().as("setOpen");

    cy.mount(
      <WorkDialog open={true} setOpen={setOpen} isActiveTeamMember={true} />,
    );

    cy.contains("Create Work").should("exist");
    cy.contains("button", "Cancel").click();

    cy.get("@setOpen").should("have.been.calledWith", false);
  });
});
