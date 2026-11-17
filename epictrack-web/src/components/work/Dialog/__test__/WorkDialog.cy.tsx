import { AppConfig } from "config";
import { worksApi } from "api/works";
import { WorkDialog } from "..";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";
import { generateMockWork } from "../../../../../cypress/support/mocks";

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

  it("saves an edit through worksApi and calls back", () => {
    const work = {
      ...generateMockWork(),
      id: 5,
      ea_act_id: 1,
      work_type_id: 1,
      project_id: 1,
      ministry_id: 1,
      federal_involvement_id: 1,
      substitution_act_id: 1,
      eao_team_id: 1,
      responsible_epd_id: 1,
      work_lead_id: 1,
      decision_by_id: 1,
    };
    cy.stub(worksApi, "get").resolves(work);
    cy.stub(worksApi, "checkExists").resolves(false);
    cy.stub(worksApi, "update").as("update").resolves(work);
    const saveWorkCallback = cy.stub().as("saveWorkCallback");

    cy.mount(
      <WorkDialog
        open={true}
        setOpen={cy.stub()}
        workId={5}
        isActiveTeamMember={true}
        saveWorkCallback={saveWorkCallback}
      />,
    );

    cy.contains(work.title).should("exist");
    cy.contains("button", "Save").click();

    cy.get("@update").should(
      "have.been.calledWith",
      5,
      Cypress.sinon.match({ simple_title: work.simple_title, project_id: 1 }),
    );
    cy.get("@saveWorkCallback").should("have.been.calledOnce");
  });
});
