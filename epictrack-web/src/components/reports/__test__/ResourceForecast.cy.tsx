import ResourceForecast from "components/reports/resourceForecast/ResourceForecast";
import { ResourceForecastModel } from "components/reports/resourceForecast/type";
import { faker } from "@faker-js/faker";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";
import { AppConfig } from "config";

const mockRFData: ResourceForecastModel[] = [
  {
    work_title: "Test Work",
    capital_investment: faker.number.int(),
    fte_positions_construction: faker.number.int(),
    fte_positions_operation: faker.number.int(),
    ea_type: "Type A",
    project_phase: "Phase 1",
    ea_act: "EA 2018",
    iaac: "Yes",
    "sector(sub)": "Energy",
    env_region: "North",
    nrs_region: "Region A",
    responsible_epd: "Jane Doe",
    eao_team: "Team 1",
    work_lead: "John Smith",
    work_team_members: "Alice, Bob",
    referral_timing: faker.date.future().toISOString(),
    months: [
      { label: "June", phase: "Prep", color: "#ccc" },
      { label: "July", phase: "Review", color: "#ddd" },
      { label: "August", phase: "Final", color: "#eee" },
      { label: "September", phase: "Done", color: "#aaa" },
    ],
    sl_no: 0,
    sub_type: "",
    type: "",
    work_id: 0,
    pre_ea: false,
  },
];

const endpoints: Endpoint[] = [
  {
    name: "getRFReport",
    method: "POST",
    url: `${AppConfig.apiUrl}reports/ea_resource_forecast*`,
    response: {
      body: mockRFData,
    },
  },
  {
    name: "downloadRFReport",
    method: "POST",
    url: `${AppConfig.apiUrl}reports/file/ea_resource_forecast*`,
  },
];

describe("ResourceForecast", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);

    cy.mount(<ResourceForecast />);
  });

  it("renders component and table", () => {
    cy.contains("Work").should("exist");
  });

  it("fetches and displays data after selecting a report date", () => {
    // Click today's date
    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    // Submit the report
    cy.contains("Submit").click();
    cy.wait("@getRFReport");
    cy.contains("Test Work").should("be.visible");
  });

  it("exports to CSV", () => {
    cy.get('[aria-label="Export to csv"]').click();
    cy.window().then((win) => {
      const link = win.document.querySelector("a[download]");
      expect(link?.getAttribute("download")).to.contain(
        "EAO_Resource_Forecast"
      );
    });
  });

  it("downloads the pdf report after selecting a date", () => {
    // Click today's date
    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    // Download the report
    cy.contains("Download").click();
    cy.wait("@downloadRFReport").then((interception) => {
      expect(interception.request.method).to.equal("POST");
      expect(interception.response?.statusCode).to.equal(200);
    });
  });
});
